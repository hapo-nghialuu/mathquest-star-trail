// Asset pipeline — imports every canonical item PNG from /assets/items/ as an
// ES module URL. Vite handles hashing, so these are the URLs the app actually
// references. Semantic naming mirrors the asset manifest in
// json/mathquest_asset_manifest.json.

import answerCardOrange from '../../assets/items/answer_card_orange.png';
import bottomNavStrip from '../../assets/items/bottom_nav_strip.png';
import bridgePathSegment from '../../assets/items/bridge_path_segment.png';
import cloudPuffLarge from '../../assets/items/cloud_puff_large.png';
import cloudPuffSoft from '../../assets/items/cloud_puff_soft.png';
import dayPathBackground from '../../assets/items/day_path_background.png';
import floatingIslandMeadow from '../../assets/items/floating_island_meadow.png';
import floatingIslandWaterfall from '../../assets/items/floating_island_waterfall.png';
import foxMascotJumping from '../../assets/items/fox_mascot_jumping.png';
import foxMascotPointing from '../../assets/items/fox_mascot_pointing.png';
import foxMascotThinking from '../../assets/items/fox_mascot_thinking.png';
import foxMascotWorried from '../../assets/items/fox_mascot_worried.png';
import lessonSkyBackground from '../../assets/items/lesson_sky_background.png';
import magicPortalBlue from '../../assets/items/magic_portal_blue.png';
import mapNodeBlankBlue from '../../assets/items/map_node_blank_blue.png';
import mapNodeCompleted3Stars from '../../assets/items/map_node_completed_3stars.png';
import mapNodeLocked from '../../assets/items/map_node_locked.png';
import navIconPractice from '../../assets/items/nav_icon_practice.png';
import navIconQuests from '../../assets/items/nav_icon_quests.png';
import navIconShop from '../../assets/items/nav_icon_shop.png';
import rewardNightBackground from '../../assets/items/reward_night_background.png';
import ribbonBannerGold from '../../assets/items/ribbon_banner_gold.png';
import sparkleParticle from '../../assets/items/sparkle_particle.png';
import starFilledGold from '../../assets/items/star_filled_gold.png';
import starOutlineEmpty from '../../assets/items/star_outline_empty.png';
import xpBadge60 from '../../assets/items/xp_badge_60.png';

export const assets = {
  // Backgrounds (opaque)
  dayPathBackground,
  lessonSkyBackground,
  rewardNightBackground,

  // Mascot
  foxMascotJumping,
  foxMascotPointing,
  foxMascotThinking,
  foxMascotWorried,

  // Map nodes
  mapNodeBlankBlue,
  mapNodeCompleted3Stars,
  mapNodeLocked,

  // Navigation
  bottomNavStrip,
  navIconPractice,
  navIconQuests,
  navIconShop,

  // Reward / celebration
  ribbonBannerGold,
  starFilledGold,
  starOutlineEmpty,
  xpBadge60,
  sparkleParticle,

  // World pieces / decor
  floatingIslandMeadow,
  floatingIslandWaterfall,
  bridgePathSegment,
  cloudPuffLarge,
  cloudPuffSoft,

  // Lesson UI
  answerCardOrange,
  magicPortalBlue,
};
