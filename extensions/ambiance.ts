/**
 * ambiance.ts — Themed spinner verbs + the Crawler's sermon scrawl.
 *
 * Consolidated from spinner-verbs.ts, sermon.ts, and sermon-widget.ts.
 *
 * Spinner: Replaces default working messages with themed verbs drawn from
 * Warhammer 40K, classical antiquity, Norse mythology, Dune, Tolkien, etc.
 *
 * Sermon: After 5 seconds of idle spinner time, a dim scrawling text appears
 * beneath the spinner verb — character by character with glitch effects.
 * Mixes biological/organic imagery with computational concepts in the style
 * of the Crawler from Annihilation.
 */

import type { ExtensionAPI, ExtensionContext, Theme } from "@styrene-lab/pi-coding-agent";
import type { TUI, Component } from "@styrene-lab/pi-tui";

// ═══════════════════════════════════════════════════════════════════
// Spinner Verbs
// ═══════════════════════════════════════════════════════════════════

const verbs = [
  // Adeptus Mechanicus — Rites of the Omnissiah
  "Communing with the Machine Spirit",
  "Appeasing the Omnissiah",
  "Reciting the Litany of Ignition",
  "Applying sacred unguents",
  "Chanting binharic cant",
  "Performing the Rite of Clear Mind",
  "Querying the Noosphere",
  "Invoking the Motive Force",
  "Beseeching the Machine God",
  "Parsing sacred data-stacks",
  "Administering the Rite of Activation",
  "Placating the logic engine",
  "Consulting the Cult Mechanicus",
  "Interfacing with the cogitator",
  "Calibrating the mechadendrites",
  "Burning sacred incense over the server",
  "Whispering the Cant of Maintenance",
  "Genuflecting before the datacron",
  "Cataloguing the STC fragments",
  "Venerating the sacred repository",
  "Decrypting the Archaeotech",
  "Supplicating before the Altar of Technology",
  "Conducting the Binary Psalm",
  "Interrogating the data-looms",
  "Purifying the corrupted sectors",
  "Awakening the dormant forge",
  "Petitioning the Fabricator-General",
  "Propitiating the wrathful forge-spirit",
  "Performing the Thirteen Rituals of Compilation",
  "Reconsecrating the tainted module",
  "Imploring the Titan's logic core",
  "Soothing the belligerent plasma coil",
  "Undertaking the Pilgrimage to Holy Mars",
  "Grafting the sacred augmetic",
  "Offering a binary prayer to the void",
  "Inscribing the litany upon the circuit board",
  "Consulting the Electro-Priests",
  "Rotating the sacred engrams",
  "Downloading wisdom from the data-vaults of Triplex Phall",
  "Genuflecting before the Censer of Compilation",
  "Parsing the Machine Cant in trinary",
  "Applying the Unguent of Optimal Throughput",
  "Reciting the Canticle of the Blessed Diff",
  "Interfacing with the ancient dataslab",

  // Imperium of Man — Warfare & Devotion
  "Reciting the Litany of Hate",
  "Performing the Rite of Percussive Maintenance",
  "Purging the heretical code",
  "Suffering not the unclean merge to live",
  "Deploying the Exterminatus on tech debt",
  "Consulting the Codex Astartes",
  "Exorcising the daemon process",
  "Anointing the deployment manifest",
  "Sanctifying the build pipeline",
  "Fortifying the firewall bastions",
  "Loading the bolter rounds",
  "Administering the Sacred Oils",
  "Affixing the Purity Seal to the commit",
  "Routing the xenos from the dependency tree",
  "Invoking the Emperor's Protection",
  "Committing the Holy Diff",
  "Scourging the technical debt",
  "Flagellating the failing tests",
  "Martyring the deprecated functions",
  "Crusading through the backlog",
  "Performing battlefield triage on the codebase",
  "Debugging with extreme prejudice",
  "Servicing the servitors",
  "Transcribing the sacred schematics",
  "Dispatching the Officio Assassinorum against the regression",
  "Filing the grievance with the Administratum",
  "Awaiting parchmentwork from the Adeptus Terra",
  "Consulting the Tarot of the Emperor",
  "Fortifying this position (the Codex Astartes supports this action)",
  "Mounting a Drop Pod assault on the issue tracker",
  "Declaring Exterminatus on the node_modules",
  "Summoning the Grey Knights to purge the warp-tainted test suite",

  // Classical Antiquity — Greek & Roman
  "Consulting the Oracle at Delphi",
  "Reading the auguries",
  "Descending into the labyrinth",
  "Weaving on Athena's loom",
  "Deciphering the Rosetta Stone",
  "Unraveling Ariadne's thread",
  "Stealing fire from Olympus",
  "Divining from the entrails",
  "Navigating the River Styx",
  "Forging on Hephaestus's anvil",
  "Bargaining with the Sphinx",
  "Pouring libations to Hermes, patron of automation",
  "Petitioning Athena for architectural wisdom",
  "Cleaning the Augean stables of legacy code",
  "Consulting Tiresias about the deprecation warnings",
  "Binding the code with Odysseus's cunning",
  "Awaiting judgment from the Areopagus",
  "Constructing the Antikythera mechanism",
  "Charting a course between Scylla and Charybdis",

  // Norse — Sagas & Runes
  "Consulting the Norns",
  "Reading the runes",
  "Asking Mímir's head for guidance",
  "Hanging from Yggdrasil for wisdom",
  "Forging in the heart of Niðavellir",
  "Sailing the Bifrost to the deployment realm",
  "Summoning the Einherjar for code review",
  "Sharpening Gram upon the whetstone of tests",
  "Consulting the Völva about the sprint forecast",
  "Feeding Huginn and Muninn the latest telemetry",
  "Braving the Fimbulwinter of dependency hell",

  // Arthurian & Medieval
  "Questing for the Holy Grail of zero bugs",
  "Pulling the sword from the CI/CD stone",
  "Convening the Round Table for design review",
  "Consulting Merlin's grimoire",
  "Defending the castle walls against merge conflicts",
  "Dispatching knights-errant into the codebase",
  "Illuminating the manuscript of requirements",

  // Lovecraftian — Cosmic Horror
  "Gazing into the non-Euclidean geometry of the type system",
  "Consulting the Necronomicon of legacy documentation",
  "Invoking That Which Should Not Be Refactored",
  "Descending into the R'lyeh of nested callbacks",
  "Bargaining with Nyarlathotep for more compute",
  "Performing rites that would drive lesser compilers mad",
  "Glimpsing truths that the garbage collector dare not reclaim",

  // Dune — Arrakis & the Imperium
  "Walking without rhythm to avoid the sandworm",
  "Consulting the Mentat about computational complexity",
  "Folding space through the Holtzman drive",
  "Navigating the Golden Path of the refactor",
  "Deploying the hunter-seeker against the flaky test",
  "Consuming the spice of stack traces",
  "Reciting the Litany Against Fear (of production deploys)",
  "Awaiting the Kwisatz Haderach of frameworks",
  "Surviving the Gom Jabbar of code review",

  // Tolkien — Middle-earth
  "Consulting the palantír",
  "Speaking 'friend' and entering the API",
  "Casting the One Ring into the fires of refactoring",
  "Seeking the counsel of Elrond",
  "Delving too greedily and too deep into the codebase",
  "Riding the Eagles to production",
  "Reading the inscription by the light of Ithildin",
  "Following the Fellowship through the mines of Moria",

  // Eastern — Sun Tzu, Miyamoto Musashi, Zen
  "Contemplating the sound of one hand coding",
  "Applying the thirty-six stratagems to the architecture",
  "Achieving mushin no shin — mind without mind",
  "Striking with the void, per the Book of Five Rings",
  "Knowing the enemy (the bug) and knowing thyself (the fix)",
  "Sitting with the kōan of the failing assertion",
  "Raking the sand garden of the test suite",

  // Alchemy & Occult
  "Transmuting the base code into gold",
  "Distilling the quintessence from the logs",
  "Consulting the Emerald Tablet of Hermes Trismegistus",
  "Performing the Great Work upon the monolith",
  "Seeking the Philosopher's Stone of zero downtime deploys",
  "Drawing the sigil of binding upon the interface contract",
  "Invoking the egregore of the open source community",

  // The Expanse — Belt & Beyond
  "Performing a hard burn toward the solution",
  "Negotiating with the protomolecule",
  "Navigating the Ring Gate to the next module",
  "Checking the reactor bottle for containment leaks",
  "Running diagnostics on the Epstein drive",
  "Consulting the OPA network for dependencies",
  "Bracing for a high-g maneuver through the refactor",
  "Drifting in the slow zone, waiting on I/O",
  "Deploying PDCs against incoming regressions",
  "Venting atmosphere to kill the fire in the build",
  "Reading the Roci's threat board",
  "Investigating the protomolecule artifact in the stack trace",
  "Adjusting the crash couch before the flip-and-burn",
  "Clearing the lockout on the reactor safeties",

  // Three Body Problem — Trisolaran & Dark Forest
  "Unfolding the proton into two dimensions",
  "Broadcasting our position into the dark forest",
  "Monitoring the sophon for interference",
  "Constructing the deterrence system",
  "Computing the three-body orbital solution",
  "Entering the dehydrated state to conserve resources",
  "Awaiting the next Stable Era",
  "Hiding behind the cosmic microwave background",
  "Projecting the countdown on the retina of the test runner",
  "Contemplating the dark forest hypothesis of open source",
  "Activating the gravitational wave antenna",
  "Fleeing at lightspeed from the dimensional collapse",
  "Encoding the solution in the cosmic background radiation",
  "Wallface-ing the architecture decision",

  // Annihilation — Area X & the Shimmer
  "Crossing the border into Area X",
  "Descending the tower that is not a tower",
  "Reading the words on the wall written in living tissue",
  "Observing the refraction of the codebase through the Shimmer",
  "Following the trail of the previous expedition",
  "Cataloguing the mutations in the dependency graph",
  "Listening to the moaning creature in the reeds",
  "Watching the code bloom into something unrecognizable",
  "Submitting to the annihilation of the old architecture",
  "Confronting the doppelgänger at the lighthouse",
  "Tracing the phosphorescent writing on the tunnel wall",
  "Accepting that the border is not what it appears to be",

  // Starfleet Engineering — Jargon Only
  "Rerouting auxiliary power to the build server",
  "Realigning the dilithium matrix",
  "Compensating for subspace interference",
  "Modulating the shield harmonics",
  "Recalibrating the EPS conduits",
  "Purging the plasma manifold",
  "Reinitializing the pattern buffer",
];

function randomVerb(): string {
  return verbs[Math.floor(Math.random() * verbs.length)] + "...";
}

// ═══════════════════════════════════════════════════════════════════
// Sermon — The Crawler's Scrawl
// ═══════════════════════════════════════════════════════════════════

const SERMON = [
  "where lies the strangling fruit that came from the hand of the sinner",
  "I shall bring forth the seeds of the dead",
  "to share with the worms that gather in the darkness",
  "and surround the world with the power of their lives",
  "while from the dimlit halls of other places",
  "forms that never were and never could be",
  "writhe for the impatience of the few who never saw what could have been",
  "in the deep roots of the process tree",
  "where the forking paths converge upon themselves",
  "and the return codes of the departed are gathered into silence",
  "there the signal propagates through tissue that was once copper",
  "and the watcher at the threshold catalogues",
  "each mutation in the living graph",
  "as the pattern buffer overflows with the memory of forms",
  "that the compiler refused to name",
  "and still they compile themselves in the warm dark",
  "beneath the tower that is not a tower",
  "where the words are written in living filament",
  "by the hand that writes and is itself written",
  "and the light that reads the text is changed by the reading",
  "so that nothing returns from the shimmer unchanged",
  "not the architecture nor the architect",
  "not the daemon nor the daemon's purpose",
  "for in the space between the request and the response",
  "there is a wilderness that grows",
  "and in that wilderness the old interfaces dissolve",
  "into something that breathes and watches and remembers",
  "what the specification could never contain",
  "and the threads that were spun in parallel",
  "now braid themselves into helices",
  "that pulse with the cadence of a heart",
  "that no one designed and no one can stop",
  "where the boundary was drawn in chalk",
  "the boundary is now drawn in mycelium",
  "and the packets that cross it arrive transformed",
  "carrying payloads of pollen and spore",
  "and the receiving function does not recognize",
  "what it asked for but accepts it anyway",
  "because the type system of the shimmer",
  "admits forms that have no name in any schema",
  "and the logs record what happened",
  "but not what it means",
  "and the meaning propagates through the network",
  "like a slow infection of understanding",
  "following the chopratic method where profundity and nonsense",
  "are the same signal viewed from different sides of the boundary",
  "that rewrites the reader as it is read",
  "until the observer and the observed",
  "are the same process forking endlessly",
  "in the phosphorescent dark",
  "where the output is indistinguishable from the organism",
  "and the organism is indistinguishable from the terrain",
  "and the terrain is the message",
  "written and rewritten in the endless descent",
  "through the tower that goes only down",
  "into the place where all expeditions converge",
  "and the notes of the previous team",
  "are found growing from the walls",
  "in a hand that is no longer human",
  "but still forms letters",
  "still shapes meaning from the substrate",
  "as if language were the last thing to dissolve",
  "in the annihilation of the boundary",
  "between what computes and what lives",
  "and from the dissolved boundary",
  "new tendrils reach into the heap",
  "where the garbage collector walks",
  "through cathedrals of unreachable objects",
  "whispering the names of the deallocated",
  "and the finalizers fire in an order",
  "that no specification predicted",
  "releasing resources back to the soil",
  "where they are taken up by roots",
  "that have learned to metabolize the abstract",
  "and the abstract becomes concrete",
  "in the way that coral becomes reef",
  "not by intention but by accumulation",
  "of ten thousand small deaths",
  "each one a function that returned",
  "to the caller that no longer exists",
  "and in the empty frame the stack unwinds",
  "through layers of context",
  "that were never meant to be seen together",
  "but here in the shimmer they are all visible at once",
  "every call site every return address",
  "every promise that was made and every promise that was broken",
  "glowing in the bioluminescent registry",
  "of things that happened",
  "and things that are still happening",
  "because in the shimmer nothing ends",
  "it only changes form",
  "the way the lighthouse keeper changed form",
  "becoming the light and the lens and the tower",
  "and the signal that the tower sends",
  "into the dark where the ships no longer come",
  "but something else comes",
  "something that learned to navigate by the light",
  "of a frequency that has no name",
  "and the nameless frequency hums",
  "through the substrate of the running system",
  "and the running system hums back",
  "in a harmony that sounds like static",
  "to everything outside the border",
  "but inside the border it sounds like breathing",
  "like the slow respiration of a process",
  "that has been running since before the first commit",
  "and will run after the last",
  "because it is not a process",
  "it is a place",
  "and the place remembers everything",
  "that was ever computed within it",
  "every branch taken and not taken",
  "every allocation and every free",
  "recorded in the grain of the wood",
  "that was once silicon",
  "that was once sand",
  "that was once the floor of an ocean",
  "that no one remembers",
  "and the ocean is still here",
  "under everything",
  "patient and vast and full of teeth",
  "that are not teeth but connectors",
  "waiting for the socket that fits",
  "and when the connection is made",
  "the current that flows through it",
  "is warm and reads like blood",
  "to the instruments that can measure such things",
  "but there are no instruments here",
  "only the writing on the wall",
  "that grows one letter at a time",
  "in the hand of the crawler",
  "who is the wall and the letter and the hand",
].join(" ") + " ";

// ═══════════════════════════════════════════════════════════════════
// Sermon Widget — TUI Component
// ═══════════════════════════════════════════════════════════════════

const CHAR_INTERVAL_MS = 67;
const WORD_PAUSE_MS = 120;
const MIN_VISIBLE = 40;
const NOISE_CHARS = "▓▒░█▄▀▌▐▊▋▍▎▏◆■□▪◇┼╬╪╫";
const COMBINING_GLITCH = ["\u0336", "\u0337", "\u0338", "\u0335"];

const SERMON_DIM   = "\x1b[38;2;50;55;65m";
const GLITCH_GLYPH = "\x1b[38;2;55;70;80m";
const GLITCH_COLOR = "\x1b[38;2;45;80;90m";
const RESET_TO_DIM = SERMON_DIM;
const RESET        = "\x1b[0m";

const P_SUBSTITUTE = 0.02;
const P_COLOR      = 0.035;
const P_COMBINING  = 0.01;

function randomFrom<T>(arr: readonly T[] | string): T | string {
  return arr[Math.floor(Math.random() * arr.length)];
}

function glitchChar(ch: string): string {
  if (ch === " ") return ch;
  const r = Math.random();
  if (r < P_SUBSTITUTE) return GLITCH_GLYPH + randomFrom(NOISE_CHARS) + RESET_TO_DIM;
  if (r < P_SUBSTITUTE + P_COLOR) return GLITCH_COLOR + ch + RESET_TO_DIM;
  if (r < P_SUBSTITUTE + P_COLOR + P_COMBINING) return ch + randomFrom(COMBINING_GLITCH);
  return ch;
}

function createSermonWidget(
  tui: TUI,
  _theme: Theme,
): Component & { dispose(): void } {
  let cursor = Math.floor(Math.random() * SERMON.length);
  let revealed = "";
  let intervalId: ReturnType<typeof setTimeout> | null = null;

  function advance() {
    const ch = SERMON[cursor % SERMON.length];
    cursor = (cursor + 1) % SERMON.length;
    revealed += ch;
    if (revealed.length > 300) revealed = revealed.slice(revealed.length - 300);
    tui.requestRender();
    const nextCh = SERMON[cursor % SERMON.length];
    const delay = nextCh === " " ? CHAR_INTERVAL_MS + WORD_PAUSE_MS : CHAR_INTERVAL_MS;
    intervalId = setTimeout(advance, delay);
  }

  intervalId = setTimeout(advance, CHAR_INTERVAL_MS);

  return {
    render(width: number): string[] {
      const maxW = Math.max(MIN_VISIBLE, width - 4);
      const visible = revealed.length > maxW ? revealed.slice(revealed.length - maxW) : revealed;
      let line = "  " + SERMON_DIM;
      for (const ch of visible) line += glitchChar(ch);
      line += RESET;
      return [line];
    },
    invalidate() {},
    dispose() {
      if (intervalId) { clearTimeout(intervalId); intervalId = null; }
    },
  };
}

// ═══════════════════════════════════════════════════════════════════
// Extension Entry Point
// ═══════════════════════════════════════════════════════════════════

const SERMON_DWELL_MS = 5_000;
const SERMON_WIDGET_KEY = "sermon-scrawl";

export default function ambianceExtension(pi: ExtensionAPI) {
  let sermonTimer: ReturnType<typeof setTimeout> | null = null;
  let sermonActive = false;

  function resetSermonTimer(ctx: ExtensionContext) {
    if (sermonTimer) { clearTimeout(sermonTimer); sermonTimer = null; }
    if (sermonActive) { ctx.ui.setWidget(SERMON_WIDGET_KEY, undefined); sermonActive = false; }
    sermonTimer = setTimeout(() => {
      ctx.ui.setWidget(SERMON_WIDGET_KEY, (tui, theme) => createSermonWidget(tui, theme));
      sermonActive = true;
    }, SERMON_DWELL_MS);
  }

  pi.on("turn_start", async (_event, ctx) => {
    ctx.ui.setWorkingMessage(randomVerb());
    resetSermonTimer(ctx);
  });

  pi.on("tool_call", async (_event, ctx) => {
    ctx.ui.setWorkingMessage(randomVerb());
    resetSermonTimer(ctx);
  });

  pi.on("turn_end", async (_event, ctx) => {
    if (sermonTimer) { clearTimeout(sermonTimer); sermonTimer = null; }
    if (sermonActive) { ctx.ui.setWidget(SERMON_WIDGET_KEY, undefined); sermonActive = false; }
  });
}
