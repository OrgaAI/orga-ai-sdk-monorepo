/**
 * Single voice entry: name is sent to realtime as the voice id; description, gender, language are for UI/docs.
 *
 * @see {@link https://docs.orga-ai.com/reference/constants/voices | Full voice info on the docs}
 */
export interface OrgaAIVoiceEntry {
  readonly name: string;
  readonly description: string;
  readonly gender: string;
  readonly language: string;
}

export const ORGAAI_VOICES = [
  {
    name: "Victoria",
    description: "Reassuring Agent",
    gender: "feminine",
    language: "English",
  },
  {
    name: "Ethan",
    description: "Modern Narrator",
    gender: "masculine",
    language: "English",
  },
  {
    name: "Juan",
    description: "Formal Speaker",
    gender: "masculine",
    language: "Español",
  },
  {
    name: "Chloe",
    description: "Lively Narrator",
    gender: "feminine",
    language: "English",
  },
  {
    name: "Marta",
    description: "Relaxed Woman",
    gender: "feminine",
    language: "Español",
  },
  {
    name: "Harold",
    description: "Caring Dad",
    gender: "masculine",
    language: "English",
  },
  {
    name: "Alex",
    description: "Modern Assistant",
    gender: "masculine",
    language: "English",
  },
  {
    name: "Julien",
    description: "Everyday Speaker",
    gender: "masculine",
    language: "Français",
  },
  {
    name: "Emilio",
    description: "Digital Voice",
    gender: "masculine",
    language: "Español",
  },
  {
    name: "Bruno",
    description: "Narration Expert",
    gender: "masculine",
    language: "Português",
  },
  {
    name: "Mariana",
    description: "Support Guide",
    gender: "feminine",
    language: "Português",
  },
  {
    name: "Carolina",
    description: "Public Speaker",
    gender: "feminine",
    language: "Português",
  },
  {
    name: "Hannah",
    description: "Mindful Woman",
    gender: "feminine",
    language: "English",
  },
  {
    name: "Valerie",
    description: "Commander",
    gender: "feminine",
    language: "English",
  },
  {
    name: "Camille",
    description: "Calm French Woman",
    gender: "feminine",
    language: "Français",
  },
  {
    name: "Clara",
    description: "Narrator",
    gender: "feminine",
    language: "Español",
  },
  {
    name: "Max",
    description: "Sportsman",
    gender: "masculine",
    language: "English",
  },
  {
    name: "Chloé",
    description: "Helpful French Lady",
    gender: "feminine",
    language: "Français",
  },
  {
    name: "Álvaro",
    description: "Confident Young Professional",
    gender: "masculine",
    language: "Español",
  },
  {
    name: "Giada",
    description: "Casual Friend",
    gender: "feminine",
    language: "Italiano",
  },
  {
    name: "Lucía",
    description: "Teacher",
    gender: "feminine",
    language: "Español",
  },
  {
    name: "Joana",
    description: "Marketer",
    gender: "feminine",
    language: "Português",
  },
  {
    name: "Aurélie",
    description: "French Narrator Lady",
    gender: "feminine",
    language: "Français",
  },
  {
    name: "Ignacio",
    description: "Clear Storyteller",
    gender: "masculine",
    language: "Español",
  },
  {
    name: "Antoine",
    description: "French Narrator Man",
    gender: "masculine",
    language: "Français",
  },
  {
    name: "Mathieu",
    description: "Friendly French Man",
    gender: "masculine",
    language: "Français",
  },
  {
    name: "André",
    description: "Supporter",
    gender: "masculine",
    language: "Português",
  },
  {
    name: "Natalia",
    description: "Clear Presenter Woman",
    gender: "feminine",
    language: "Español",
  },
  {
    name: "Ricardo",
    description: "News Caster",
    gender: "masculine",
    language: "Español",
  },
  {
    name: "Adrian",
    description: "Voiceover Man",
    gender: "masculine",
    language: "English",
  },
  {
    name: "Rafael",
    description: "Casual Talker",
    gender: "masculine",
    language: "Português",
  },
  {
    name: "Gustavo",
    description: "Anchorperson",
    gender: "masculine",
    language: "Português",
  },
  {
    name: "Marco",
    description: "Empath",
    gender: "masculine",
    language: "Italiano",
  },
  {
    name: "Alessandro",
    description: "Gentle Narrator",
    gender: "masculine",
    language: "Italiano",
  },
  {
    name: "Matteo",
    description: "Everyday Friend",
    gender: "masculine",
    language: "Italiano",
  },
  {
    name: "Davide",
    description: "Friendly Conversationalist",
    gender: "masculine",
    language: "Italiano",
  },
  {
    name: "Valentina",
    description: "Elegant Partner",
    gender: "feminine",
    language: "Italiano",
  },
  {
    name: "Serena",
    description: "Melodic Guide",
    gender: "feminine",
    language: "Italiano",
  },
  {
    name: "Roberto",
    description: "Support Leader",
    gender: "masculine",
    language: "Italiano",
  },
  {
    name: "Emma",
    description: "Digital Guide",
    gender: "feminine",
    language: "English",
  },
  {
    name: "Bernard",
    description: "Monsieur Noir",
    gender: "masculine",
    language: "Français",
  },
  {
    name: "Élise",
    description: "Bright Belle",
    gender: "feminine",
    language: "Français",
  },
  {
    name: "Nadine",
    description: "Firm French Woman",
    gender: "feminine",
    language: "Français",
  },
  {
    name: "Laurent",
    description: "Command Coach",
    gender: "masculine",
    language: "Français",
  },
  {
    name: "Sofía",
    description: "Soft Calm Spanish Woman",
    gender: "feminine",
    language: "Español",
  },
  {
    name: "Teresa",
    description: "Doting Mother",
    gender: "feminine",
    language: "Español",
  },
  {
    name: "Helena",
    description: "Confident Woman",
    gender: "feminine",
    language: "Português",
  },
  {
    name: "Lorenzo",
    description: "Retro Man",
    gender: "masculine",
    language: "Italiano",
  },
  {
    name: "Henrique",
    description: "Promotion Lead",
    gender: "masculine",
    language: "Português",
  },
  {
    name: "Paola",
    description: "Teacherly Voice",
    gender: "feminine",
    language: "Italiano",
  },
] as const satisfies readonly OrgaAIVoiceEntry[];

/**
 * Voice name sent to realtime as the voice id. Use with `OrgaAI.init({ voice })` or session config.
 *
 * Full details (samples, languages, and more) are on the docs website.
 *
 * **Hover a name below for description, gender, and language:**
 *
 * - **Victoria** — Reassuring Agent (feminine, English)
 * - **Ethan** — Modern Narrator (masculine, English)
 * - **Juan** — Formal Speaker (masculine, Español)
 * - **Chloe** — Lively Narrator (feminine, English)
 * - **Marta** — Relaxed Woman (feminine, Español)
 * - **Harold** — Caring Dad (masculine, English)
 * - **Alex** — Modern Assistant (masculine, English)
 * - **Julien** — Everyday Speaker (masculine, Français)
 * - **Emilio** — Digital Voice (masculine, Español)
 * - **Bruno** — Narration Expert (masculine, Português)
 * - **Mariana** — Support Guide (feminine, Português)
 * - **Carolina** — Public Speaker (feminine, Português)
 * - **Hannah** — Mindful Woman (feminine, English)
 * - **Valerie** — Commander (feminine, English)
 * - **Camille** — Calm French Woman (feminine, Français)
 * - **Clara** — Narrator (feminine, Español)
 * - **Max** — Sportsman (masculine, English)
 * - **Chloé** — Helpful French Lady (feminine, Français)
 * - **Álvaro** — Confident Young Professional (masculine, Español)
 * - **Giada** — Casual Friend (feminine, Italiano)
 * - **Lucía** — Teacher (feminine, Español)
 * - **Joana** — Marketer (feminine, Português)
 * - **Aurélie** — French Narrator Lady (feminine, Français)
 * - **Ignacio** — Clear Storyteller (masculine, Español)
 * - **Antoine** — French Narrator Man (masculine, Français)
 * - **Mathieu** — Friendly French Man (masculine, Français)
 * - **André** — Supporter (masculine, Português)
 * - **Natalia** — Clear Presenter Woman (feminine, Español)
 * - **Ricardo** — News Caster (masculine, Español)
 * - **Adrian** — Voiceover Man (masculine, English)
 * - **Rafael** — Casual Talker (masculine, Português)
 * - **Gustavo** — Anchorperson (masculine, Português)
 * - **Marco** — Empath (masculine, Italiano)
 * - **Alessandro** — Gentle Narrator (masculine, Italiano)
 * - **Matteo** — Everyday Friend (masculine, Italiano)
 * - **Davide** — Friendly Conversationalist (masculine, Italiano)
 * - **Valentina** — Elegant Partner (feminine, Italiano)
 * - **Serena** — Melodic Guide (feminine, Italiano)
 * - **Roberto** — Support Leader (masculine, Italiano)
 * - **Emma** — Digital Guide (feminine, English)
 * - **Bernard** — Monsieur Noir (masculine, Français)
 * - **Élise** — Bright Belle (feminine, Français)
 * - **Nadine** — Firm French Woman (feminine, Français)
 * - **Laurent** — Command Coach (masculine, Français)
 * - **Sofía** — Soft Calm Spanish Woman (feminine, Español)
 * - **Teresa** — Doting Mother (feminine, Español)
 * - **Helena** — Confident Woman (feminine, Português)
 * - **Lorenzo** — Retro Man (masculine, Italiano)
 * - **Henrique** — Promotion Lead (masculine, Português)
 * - **Paola** — Teacherly Voice (feminine, Italiano)
 *
 * @see ORGAAI_VOICES — array of all voices for dropdowns/iteration
 * @see getVoiceDetails — get description, gender, language for a voice name
 * @see {@link https://docs.orga-ai.com/reference/constants/voices | Full voice info on the docs}
 */
export type OrgaAIVoice = (typeof ORGAAI_VOICES)[number]["name"];

/** Default voice used when none is set (Victoria). */
export const DEFAULT_ORGAAI_VOICE: OrgaAIVoice = ORGAAI_VOICES[0].name;

/**
 * Returns description, gender, and language for a voice name. Use for tooltips and UI.
 *
 * @param voice — Voice name (e.g. from OrgaAI.init or ORGAAI_VOICES)
 * @returns Metadata for the voice, or undefined if not found
 * @see {@link https://docs.orga-ai.com/reference/constants/voices | Full voice info on the docs}
 */
export function getVoiceDetails(voice: OrgaAIVoice): OrgaAIVoiceEntry | undefined {
  return ORGAAI_VOICES.find((v) => v.name === voice);
}
