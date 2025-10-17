// Re-export everything from the shared core
export * from "@orga-ai/core";

// Vue-specific exports
export { useOrgaAI as useOrgaAIComposable } from "./composables/useOrgaAI";
export * from "./composables/useOrgaAIProvider";
// TODO: Export Vue components once build issues are resolved
// export { default as OrgaAudio } from "./components/OrgaAudio.vue";
// export { default as OrgaVideo } from "./components/OrgaVideo.vue";