// Re-export the authoritative JSON configs from /json/ so the rest of the app
// can `import { mvpConfig } from './data/config'`.

import mvpConfig from '../../json/mathquest_mvp_implementation_config.json';
import assetManifest from '../../json/mathquest_asset_manifest.json';
import artGuideline from '../../json/mathquest_ai_agent_art_guideline.json';

export { mvpConfig, assetManifest, artGuideline };

// Convenience: the initial learner state from the MVP config.
export const initialLearnerState = mvpConfig.initial_learner_state;

// Convenience: scoring rules.
export const scoringRules = mvpConfig.scoring_rules;
