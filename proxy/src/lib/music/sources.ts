export type MusicSource =
  | {
      provider: 'netease' | 'qq' | 'bilibili' | 'spotify';
      id: string;
      page?: number;
    }
  | { provider: 'direct' | 'local'; url: string };

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  artwork?: string;
  duration?: number;
  source: MusicSource;
  playbackUrl?: string;
}

export type Playback =
  | {
      kind: 'audio';
      url: string;
      analysis?: 'web-audio' | 'unavailable';
    }
  | { kind: 'external'; message: string };

export interface ResolvedTrack {
  title?: string;
  artist?: string;
  artwork?: string;
  playback: Playback;
}

export type TrackResolver = (
  track: MusicTrack,
  signal: AbortSignal,
) => Promise<ResolvedTrack>;

export const providerNames: Record<MusicSource['provider'], string> = {
  netease: 'NetEase Music',
  qq: 'QQ Music',
  bilibili: 'Bilibili',
  spotify: 'Spotify',
  direct: 'Audio link',
  local: 'Local audio',
};

export function parseMusicSource(input: string): MusicSource {
  if (/^spotify:track:[a-zA-Z0-9]{22}$/.test(input))
    return { provider: 'spotify', id: input.split(':')[2]! };
  if (input.startsWith('/') && !input.startsWith('//')) {
    const decoded = decodeURIComponent(input);
    if (
      /[\\?#]/.test(decoded) ||
      /(?:^|\/)\.\.(?:\/|$)/.test(decoded) ||
      decoded.startsWith('//')
    )
      throw new Error('Use a path inside the public audio directory');
    return { provider: 'local', url: input };
  }
  const url = new URL(input);
  if (url.protocol !== 'https:' || url.username || url.password)
    throw new Error('Use an HTTPS music URL');
  const host = url.hostname;
  if (host === 'music.163.com' || host === 'y.music.163.com') {
    const hash = url.hash.replace(/^#\/?/, '/');
    const id =
      url.searchParams.get('id') ??
      new URL(hash || '/', url.origin).searchParams.get('id');
    if (!id || !/^\d+$/.test(id))
      throw new Error('Use a NetEase song URL with an ID');
    return { provider: 'netease', id };
  }
  if (host === 'y.qq.com') {
    const id =
      url.pathname.match(/(?:songDetail|song)\/([a-zA-Z0-9]+)/)?.[1] ??
      url.pathname.match(/song\/([a-zA-Z0-9]+)\.html/)?.[1] ??
      url.searchParams.get('songmid');
    if (!id || !/^[a-zA-Z0-9]+$/.test(id))
      throw new Error('Use a QQ Music song URL with a song MID');
    return { provider: 'qq', id };
  }
  if (host === 'www.bilibili.com' || host === 'bilibili.com') {
    const id = url.pathname.match(/\/video\/(BV[a-zA-Z0-9]{10})/)?.[1];
    const page = Number(url.searchParams.get('p') ?? 1);
    if (!id || !Number.isInteger(page) || page < 1)
      throw new Error('Use a Bilibili BV video URL');
    return { provider: 'bilibili', id, page };
  }
  if (host === 'open.spotify.com') {
    const id = url.pathname.match(
      /\/(?:intl-[a-z]+\/)?track\/([a-zA-Z0-9]{22})(?:\/|$)/,
    )?.[1];
    if (!id) throw new Error('Use a Spotify track URL');
    return { provider: 'spotify', id };
  }
  return { provider: 'direct', url: url.href };
}

export function musicSourceUrl(source: MusicSource): string {
  switch (source.provider) {
    case 'netease':
      return `https://music.163.com/#/song?id=${encodeURIComponent(source.id)}`;
    case 'qq':
      return `https://y.qq.com/n/ryqq/songDetail/${encodeURIComponent(source.id)}`;
    case 'bilibili':
      return `https://www.bilibili.com/video/${encodeURIComponent(source.id)}/?p=${source.page ?? 1}`;
    case 'spotify':
      return `https://open.spotify.com/track/${encodeURIComponent(source.id)}`;
    default:
      return source.url;
  }
}

// Provider metadata is separate from a usable playback capability.
export const resolvePublicAudio: TrackResolver = async (track) => {
  if (track.playbackUrl) {
    // Relative-base builds resolve imported assets against the current host.
    if (typeof location !== 'undefined') {
      const asset = new URL(track.playbackUrl, location.href);
      if (
        asset.origin === location.origin &&
        ['http:', 'https:'].includes(asset.protocol) &&
        !asset.username &&
        !asset.password
      )
        return { playback: { kind: 'audio', url: asset.href } };
    }
    const audio = parseMusicSource(track.playbackUrl);
    if (audio.provider !== 'local' && audio.provider !== 'direct')
      throw new Error('Playback requires an audio file, not a platform page');
    return { playback: { kind: 'audio', url: audio.url } };
  }
  switch (track.source.provider) {
    case 'local':
    case 'direct':
      return { playback: { kind: 'audio', url: track.source.url } };
    case 'netease':
      return {
        playback: {
          kind: 'audio',
          url: `https://music.163.com/song/media/outer/url?id=${encodeURIComponent(track.source.id)}.mp3`,
          // The public redirect supports media playback, but not CORS analysis.
          analysis: 'unavailable',
        },
      };
    case 'spotify':
      return {
        playback: {
          kind: 'external',
          message:
            'Connect Spotify to play here. Open the track in Spotify for now.',
        },
      };
    default:
      return {
        playback: {
          kind: 'external',
          message:
            'This source needs a playback connection. Open the original track for now.',
        },
      };
  }
};
