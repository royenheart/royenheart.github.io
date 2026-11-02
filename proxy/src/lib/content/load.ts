import siteData from '../../content/site.json';
import playlistData from '../../content/playlist.json';
import sceneData from '../../content/scenes.json';
import { siteSchema, playlistSchema, scenesSchema } from './schema';

export const site = siteSchema.parse(siteData);
export const playlist = playlistSchema.parse(playlistData);
export const scenes = scenesSchema.parse(sceneData);
