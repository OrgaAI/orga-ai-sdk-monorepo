"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataChannelEventTypes = exports.ORGAAI_TEMPERATURE_RANGE = exports.ORGAAI_VOICES = exports.MODALITIES_ENUM = exports.ORGAAI_MODELS = void 0;
// Allowed models and voices (example values, update as needed)
exports.ORGAAI_MODELS = ["orga-1-beta"];
exports.MODALITIES_ENUM = {
    VIDEO: "video",
    AUDIO: "audio",
};
exports.ORGAAI_VOICES = [
    "alloy",
    "ash",
    "ballad",
    "coral",
    "echo",
    "fable",
    "onyx",
    "nova",
    "sage",
    "shimmer",
];
exports.ORGAAI_TEMPERATURE_RANGE = {
    min: 0.0,
    max: 1.0,
};
var DataChannelEventTypes;
(function (DataChannelEventTypes) {
    DataChannelEventTypes["USER_SPEECH_TRANSCRIPTION"] = "conversation.item.input_audio_transcription.completed";
    DataChannelEventTypes["ASSISTANT_RESPONSE_COMPLETE"] = "response.output_item.done";
    DataChannelEventTypes["SESSION_UPDATE"] = "session.update";
    DataChannelEventTypes["AGENT_REQUEST"] = "orga_agent.request";
    DataChannelEventTypes["AGENT_RESULT"] = "orga_agent.result";
})(DataChannelEventTypes || (exports.DataChannelEventTypes = DataChannelEventTypes = {}));
