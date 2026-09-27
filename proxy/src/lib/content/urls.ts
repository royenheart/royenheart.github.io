import type { Track } from './schema';

export function trackUrl(track: Track): string {
  return `https://music.163.com/#/song?id=${encodeURIComponent(track.songId)}`;
}
export function embedUrl(track: Track): string {
  return `https://music.163.com/outchain/player?type=2&id=${encodeURIComponent(track.songId)}&auto=0&height=66`;
}
