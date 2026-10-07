import siteData from '../../content/site.json';
import sceneData from '../../content/scenes.json';
import { siteSchema, scenesSchema } from './schema';

export const site = siteSchema.parse(siteData);
export const scenes = scenesSchema.parse(sceneData);
