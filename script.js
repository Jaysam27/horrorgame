const gameTextElement = document.getElementById('game-text');
const typingCursor = document.getElementById('typing-cursor');
const choicesContainer = document.getElementById('choices-container');
const sanityBarFill = document.getElementById('sanity-bar-fill');
const sanityLevelDisplay = document.getElementById('sanity-level-display');
const timeDisplay = document.getElementById('time-display');
const journalButton = document.getElementById('journal-button');
const journalPanel = document.getElementById('journal-panel');
const journalEntriesContainer = document.getElementById('journal-entries');
const closeJournalButton = document.getElementById('close-journal-button');
const gameContainer = document.getElementById('game-container');
const gameTitle = document.getElementById('game-title');
const overlayEffects = document.getElementById('overlay-effects');
const messageBox = document.getElementById('message-box');
const messageText = document.getElementById('message-text');
const messageOkButton = document.getElementById('message-ok-button');

let gameState = {
    currentScene: 'intro', // Game starts with the intro scene
    sanityLevel: 100,
    hasKey: false,
    hasFlashlight: false,
    hasLocket: false,
    hasJournal: false,
    timeOfDay: 0, // 0: Dawn, 1: Morning, 2: Midday, 3: Afternoon, 4: Dusk, 5: Night, 6: Deep Night
    journalEntries: [],
    lastEndingMessage: ""
};

const timeNames = ["Dawn", "Morning", "Midday", "Afternoon", "Dusk", "Night", "Deep Night"];
const sanityThresholds = {
    high: 80,
    medium: 50,
    low: 20,
    critical: 0
};

const scenes = {
    intro: {
        text: "Welcome to Shadows in the Silence. In this text-based horror adventure, your choices guide your fate. Pay attention to your Sanity Level at the bottom of the screen, as it influences your perception and available actions. Discover clues and track your progress in the Journal. Good luck, and try not to lose your mind in the dark.",
        choices: [
            { text: "Begin your nightmare...", nextScene: 'start', sanityChange: 0 }
        ],
        timeProgression: 0
    },
    start: {
        text: "The air hangs heavy, thick with an unseen presence. The old house groans around you, a symphony of creaks and whispers. Moonlight, thin and sickly, struggles through the grimy windowpanes, casting long, distorted shadows that dance with every beat of your hammering heart. A chilling draft snakes its way up your spine, despite the oppressive stillness of the room. You are alone, yet profoundly not.",
        choices: [
            { text: "Investigate the sound", nextScene: 'creakSound', sanityChange: -5 },
            { text: "Hide in the shadows", nextScene: 'hide', sanityChange: 0 }
        ],
        timeProgression: 0
    },
    creakSound: {
        text: "You inch towards the source of the creaking. It seems to come from the hallway. Each step you take resonates unnaturally loud in the silence. A sudden, sharp THUD echoes from deeper within the house, making you jump. The shadows around you seem to deepen, growing more defined, almost watchful.",
        choices: [
            { text: "Proceed into the hallway", nextScene: 'hallway', sanityChange: -10 },
            { text: "Retreat back to the room", nextScene: 'retreatRoom', sanityChange: -2 }
        ],
        timeProgression: 1,
        visualEffect: 'shake'
    },
    hide: {
        text: "You press yourself against the cold wall, trying to meld with the darkness. The silence stretches, becoming a suffocating blanket. You hear a soft, dragging sound from somewhere nearby, then it stops. The absence of sound is worse than the noise. You feel a strange chill.",
        choices: [
            { text: "Peek around the corner", nextScene: 'hallway', sanityChange: -5 },
            { text: "Remain hidden, waiting for dawn", nextScene: 'waitHidden', sanityChange: -10, requiredSanity: sanityThresholds.medium }
        ],
        timeProgression: 1,
        visualEffect: 'static'
    },
    retreatRoom: {
        text: "You scramble back into the relative safety of the room. Your heart pounds. You feel like you've just escaped something, but the feeling of being watched intensifies. There's a faint glint under an old dusty rug.",
        choices: [
            { text: "Examine the glint", nextScene: 'glint', sanityChange: 0 },
            { text: "Try to find an exit", nextScene: 'exitAttempt', sanityChange: -5 }
        ],
        timeProgression: 1
    },
    glint: {
        text: "You pull back the rug to reveal a small, rusted flashlight. It's old, but perhaps still functional. You pick it up, its cold metal a small comfort in the suffocating darkness. You also notice a loose floorboard nearby.",
        choices: [
            { text: "Try the flashlight", nextScene: 'tryFlashlight', sanityChange: 0 },
            { text: "Pry open the floorboard", nextScene: 'floorboard', sanityChange: -5 }
        ],
        onEnter: () => { gameState.hasFlashlight = true; addJournalEntry("Found a rusty flashlight. Might be useful."); },
        timeProgression: 0
    },
    tryFlashlight: {
        text: "You click the button. With a weak flicker, a beam of light struggles forth, cutting a pathetic path through the gloom. It's not much, but it's something. The light illuminates a faded drawing on the wall. A sense of unease washes over you as the light reveals more of the grime.",
        choices: [
            { text: "Examine the drawing", nextScene: 'drawing', sanityChange: -10 },
            { text: "Look for an exit with the light", nextScene: 'exitWithLight', sanityChange: -5 }
        ],
        required: { hasFlashlight: true },
        timeProgression: 1,
        visualEffect: 'flicker'
    },
    floorboard: {
        text: "You manage to pry open the loose floorboard. Inside, nestled in cobwebs, is a small, ornate key. It feels strangely heavy in your palm. A distant mournful wail suddenly cuts through the air, causing your blood to run cold.",
        choices: [
            { text: "Take the key and investigate the wail", nextScene: 'hallway', sanityChange: -15 },
            { text: "Take the key and try to hide again", nextScene: 'waitHidden', sanityChange: -10 }
        ],
        onEnter: () => { gameState.hasKey = true; addJournalEntry("Discovered an ornate key beneath the floorboard."); },
        timeProgression: 1,
        visualEffect: 'shake'
    },
    hallway: {
        text: "The hallway is a narrow, oppressive tunnel of shadows. Doors line both sides, silent and ominous. A faint, putrid smell hangs in the air. You hear a soft, scuttling sound behind one of the doors. The air grows colder here.",
        choices: [
            { text: "Approach the door with the sound", nextScene: 'doorSound', sanityChange: -15 },
            { text: "Try a different door", nextScene: 'randomDoor', sanityChange: -8 },
            { text: "Go back to the room", nextScene: 'retreatRoom', sanityChange: -3 }
        ],
        timeProgression: 1,
        visualEffect: 'vignette'
    },
    doorSound: {
        text: "As you approach, the scuttling grows louder, more frantic. It sounds like something desperate to get out. You see an old, rusty padlock on the door. You feel a chilling presence on the other side.",
        choices: [
            { text: "Use the key to open the door", nextScene: 'openPadlockedDoor', sanityChange: -25, required: { hasKey: true } },
            { text: "Knock on the door", nextScene: 'knockDoor', sanityChange: -20 },
            { text: "Leave the door alone", nextScene: 'hallway', sanityChange: -5 }
        ],
        timeProgression: 1,
        visualEffect: 'distort'
    },
    openPadlockedDoor: {
        text: "The key grinds in the lock, then clicks. You slowly push the door open, revealing... nothing but an empty, dust-filled closet. The scuttling sound was just rats. The relief is palpable, but short-lived as you feel a cold breath on your neck. You are not alone in the closet. A dark, swirling mist forms before you.",
        choices: [],
        end: { type: 'bad', message: "You turn to see... a void. Your last sensation is an overwhelming chill as the darkness consumes you. ENDING: Consumed by the Void." },
        timeProgression: 1,
        visualEffect: 'fadeOut'
    },
    knockDoor: {
        text: "You rap lightly on the door. The scuttling stops abruptly. A moment of silence, then a low, guttural GROWL emanates from within. The door shudders violently, splinters flying. You step back, fear clawing at your throat. Your mind screams to run.",
        choices: [
            { text: "Run!", nextScene: 'runFromDoor', sanityChange: -30 },
            { text: "Stay and listen (Foolish)", nextScene: 'stayListen', sanityChange: -40, requiredSanity: sanityThresholds.low }
        ],
        timeProgression: 1,
        visualEffect: 'shake'
    },
    runFromDoor: {
        text: "You stumble back, terror propelling you. You don't know where you're going, just away. You trip over something unseen in the dim light and fall, hitting your head hard. Darkness takes you. The house seems to laugh.",
        choices: [],
        end: { type: 'bad', message: "The last thing you feel is the cold floor. You never wake up. ENDING: The Fall." },
        timeProgression: 1,
        visualEffect: 'fadeOut'
    },
    stayListen: {
        text: "The growling intensifies, becoming a rhythmic, predatory sound. You realize it's getting closer, the door rattling furiously. A clawed hand bursts through the wood, inches from your face. There is no escape. The creature's eyes glow with malevolence.",
        choices: [],
        end: { type: 'bad', message: "The creature drags you into the darkness, your screams abruptly silenced. ENDING: Devoured." },
        timeProgression: 1,
        visualEffect: 'shake'
    },
    randomDoor: {
        text: "You open a random door. It leads to a dark, musty pantry. Rows of empty jars line the shelves, covered in dust. As you turn to leave, you hear a faint, almost melodic humming from behind a stack of crates. It's oddly alluring.",
        choices: [
            { text: "Investigate the humming", nextScene: 'hummingPantry', sanityChange: -15 },
            { text: "Leave the pantry", nextScene: 'hallway', sanityChange: -5 }
        ],
        timeProgression: 1
    },
    hummingPantry: {
        text: "You cautiously approach the crates. The humming grows louder, more distinct, chillingly beautiful. You pull away a crate to reveal... a small, dusty music box, playing on its own. As you reach for it, the room suddenly goes cold, and you feel a suffocating weight press down on you. Visions of forgotten horrors flood your mind.",
        choices: [],
        end: { type: 'bad', message: "The melody fills your mind, trapping you in an endless, frozen moment. You become another silent guardian of the house. ENDING: The Music Box's Prisoner." },
        timeProgression: 1,
        visualEffect: 'flicker'
    },
    waitHidden: {
        text: "You remain motionless, listening. Minutes stretch into an eternity. The dragging sound doesn't return. Eventually, the silence becomes unbearable. You need to move. Your muscles ache from tension.",
        choices: [
            { text: "Try the hallway", nextScene: 'hallway', sanityChange: -5 },
            { text: "Look for anything in this room", nextScene: 'glint', sanityChange: 0 }
        ],
        timeProgression: 2
    },
    exitAttempt: {
        text: "You try the door you came in through. It's locked. A shiver runs down your spine as you realize you're trapped. Panic begins to set in. The walls seem to close in.",
        choices: [
            { text: "Look for another way out", nextScene: 'searchRoom', sanityChange: -10 },
            { text: "Force the door", nextScene: 'forceDoor', sanityChange: -15 }
        ],
        timeProgression: 1,
        visualEffect: 'static'
    },
    forceDoor: {
        text: "You throw your weight against the door, again and again. It groans, but holds firm. Your efforts only attract unwanted attention. A faint, low growl echoes from deep within the house, closer now. You hear footsteps approaching.",
        choices: [
            { text: "Give up and search the room", nextScene: 'searchRoom', sanityChange: -10 },
            { text: "Try the window", nextScene: 'windowAttempt', sanityChange: -15 }
        ],
        timeProgression: 1,
        visualEffect: 'shake'
    },
    windowAttempt: {
        text: "You rush to the window. It's old, warped wood. You try to pry it open, but it's stuck fast. As you struggle, a distorted face presses against the glass from outside, its eyes burning holes into your soul. It's gone as quickly as it appeared, leaving an icy imprint on the glass. Your heart stops.",
        choices: [],
        end: { type: 'bad', message: "The horror of the face lingers, shattering your mind. You collapse, overwhelmed by the terror. ENDING: Shattered Reality." },
        timeProgression: 1,
        visualEffect: 'flicker'
    },
    searchRoom: {
        text: "You frantically search the dusty room. Under a pile of decaying books, you find a small, tarnished locket. As you open it, a faint, sweet scent of roses fills the air, and a calming warmth spreads through you. You feel a strange connection to the house, a sense of peace amidst the dread. You also find a small, leather-bound journal.",
        choices: [
            { text: "Keep the locket and explore further", nextScene: 'hallway', sanityChange: 10 },
            { text: "Read the journal", nextScene: 'readJournal', sanityChange: 5 }
        ],
        onEnter: () => { gameState.hasLocket = true; gameState.hasJournal = true; addJournalEntry("Found a tarnished locket and a dusty journal. The locket brings a strange calm."); },
        timeProgression: 1
    },
    readJournal: {
        text: "The journal's pages are filled with frantic, looping handwriting, detailing rituals and incantations to banish malevolent spirits. The final entry speaks of a hidden 'true' exit, activated by speaking a specific phrase. It also mentions strange symbols in the master bedroom.",
        choices: [
            { text: "Recite the phrase (if you have the locket)", nextScene: 'trueExit', sanityChange: -20, required: { hasLocket: true } },
            { text: "Look for the master bedroom", nextScene: 'masterBedroomEntry', sanityChange: -5 },
            { text: "Continue searching for other exits", nextScene: 'exitAttempt', sanityChange: -5 }
        ],
        onEnter: () => addJournalEntry("Journal entry: Details on banishing spirits and a 'true' exit phrase. Also mentions master bedroom symbols."),
        timeProgression: 1
    },
    locketPower: {
        text: "As you focus on the locket, a vision flashes before your eyes: a woman, weeping, placing something behind a loose brick in the fireplace. The vision fades, leaving you with a strange clarity. The house feels less hostile.",
        choices: [
            { text: "Check the fireplace", nextScene: 'fireplace', sanityChange: 5 },
            { text: "Ignore the vision, try the hallway", nextScene: 'hallway', sanityChange: 0 }
        ],
        required: { hasLocket: true },
        timeProgression: 0
    },
    fireplace: {
        text: "You approach the ancient fireplace. Behind a loose brick, you find a small, leather-bound journal. Its pages are filled with frantic, looping handwriting, detailing rituals and incantations to banish malevolent spirits. The final entry speaks of a hidden 'true' exit, activated by speaking a specific phrase. The locket hums faintly in your hand.",
        choices: [
            { text: "Recite the phrase", nextScene: 'trueExit', sanityChange: -20 },
            { text: "Continue searching for other exits", nextScene: 'exitAttempt', sanityChange: -5 }
        ],
        onEnter: () => { gameState.hasJournal = true; addJournalEntry("Journal entry: Details on banishing spirits and a 'true' exit phrase. The locket's vision led me here."); },
        timeProgression: 1
    },
    trueExit: {
        text: "You speak the ancient phrase aloud. The house shudders violently, not with malice, but with a deep, resonant hum. A section of the wall beside the fireplace slides open, revealing a hidden passage bathed in soft, ethereal light. You step through, leaving the darkness behind. The air is fresh, the sky is clear.",
        choices: [],
        end: { type: 'good', message: "You emerge into the dawn, the house a distant memory, its shadows finally banished from your mind. You are free. ENDING: Freedom." },
        timeProgression: 1,
        visualEffect: 'fadeIn'
    },
    drawing: {
        text: "The faded drawing depicts a grotesque, multi-limbed creature, its eyes piercing. It seems to be a warning, or perhaps a prophecy. As you stare, the creature's eyes in the drawing seem to follow you, and the lines begin to writhe. A cold dread settles in your stomach.",
        choices: [
            { text: "Look away quickly", nextScene: 'retreatRoom', sanityChange: -10 },
            { text: "Try to discern its meaning (Dangerous)", nextScene: 'drawingMeaning', sanityChange: -25, requiredSanity: sanityThresholds.medium }
        ],
        timeProgression: 1,
        visualEffect: 'static'
    },
    drawingMeaning: {
        text: "As you try to understand the drawing, a cold whisper brushes your ear, speaking an ancient, incomprehensible language. You feel a sudden, crushing weight of despair. The lines of the drawing twist and writhe before your eyes, forming new, terrifying shapes. Your mind screams, unable to process the horror.",
        choices: [],
        end: { type: 'bad', message: "The drawing consumes your sanity, leaving you an empty shell, forever bound to its horrifying truth. ENDING: The Artist's Curse." },
        timeProgression: 1,
        visualEffect: 'shake'
    },
    exitWithLight: {
        text: "The weak beam of your flashlight cuts through some of the gloom, but the house still feels vast and impenetrable. You see a faint outline of a door in the far wall, almost invisible without the light. It looks ancient, perhaps a rarely used back exit. The air around it feels heavy.",
        choices: [
            { text: "Attempt to open it", nextScene: 'ancientDoor', sanityChange: -10 },
            { text: "Return to the hallway", nextScene: 'hallway', sanityChange: -2 }
        ],
        required: { hasFlashlight: true },
        timeProgression: 1
    },
    ancientDoor: {
        text: "The door is heavy, made of dark, rotting wood. You push and pull, hearing groans and creaks from its ancient hinges. With a final, desperate heave, it gives way, revealing... a winding, dark staircase leading down into utter blackness. A cold wind blows up from below, carrying a faint, metallic scent.",
        choices: [
            { text: "Descend the stairs", nextScene: 'descendStairs', sanityChange: -20 },
            { text: "Close the door and find another way", nextScene: 'retreatRoom', sanityChange: -5 }
        ],
        timeProgression: 1
    },
    descendStairs: {
        text: "You take a single step onto the creaking stairs. The darkness below is absolute, devouring the weak light from your flashlight. A sudden, piercing shriek echoes from the depths, and you feel yourself plummeting into the abyss. The air grows impossibly cold.",
        choices: [],
        end: { type: 'bad', message: "The fall is endless, soundless. You become one with the profound, suffocating darkness. ENDING: The Endless Descent." },
        timeProgression: 1,
        visualEffect: 'fadeOut'
    },
    fearEnding: {
        text: "The terror has become too much. Your mind fractures, unable to bear the weight of the house's malevolence. Visions flash before your eyes: grotesque figures, whispering shadows, impossible geometries. You curl into a ball, whimpering, lost to the shadows within your own mind. The house has claimed you.",
        choices: [],
        end: { type: 'bad', message: "The house consumes your last vestiges of sanity. You are gone, but your fear remains, a lingering echo. ENDING: Broken Mind." },
        timeProgression: 0,
        visualEffect: 'shake'
    },
    masterBedroomEntry: {
        text: "You find a grand, ornate door at the end of the hallway. A faint, sickly sweet smell emanates from within. This must be the master bedroom mentioned in the journal. You feel a pull towards it, a morbid curiosity.",
        choices: [
            { text: "Enter the master bedroom", nextScene: 'masterBedroom', sanityChange: -15 },
            { text: "Return to the hallway", nextScene: 'hallway', sanityChange: -5 }
        ],
        timeProgression: 1
    },
    masterBedroom: {
        text: "The master bedroom is draped in cobwebs and dust, but its former grandeur is still evident. A large, four-poster bed dominates the center, its curtains tattered. On the wall opposite, strange, glowing symbols are painted in what looks like dried blood. They pulse faintly.",
        choices: [
            { text: "Examine the symbols", nextScene: 'examineSymbols', sanityChange: -20 },
            { text: "Search the room for clues", nextScene: 'searchMasterBedroom', sanityChange: -5 }
        ],
        timeProgression: 1,
        visualEffect: 'flicker'
    },
    examineSymbols: {
        text: "As you approach the symbols, they glow brighter, and a low, guttural chanting fills the air, seemingly from nowhere. The symbols begin to shift, forming patterns that hurt your eyes to look at. You feel a profound sense of wrongness, and your sanity wavers.",
        choices: [
            { text: "Try to decipher the symbols (requires high sanity)", nextScene: 'decipherSymbols', sanityChange: -30, requiredSanity: sanityThresholds.medium },
            { text: "Back away quickly", nextScene: 'masterBedroom', sanityChange: -10 }
        ],
        onEnter: () => addJournalEntry("Observed strange, glowing symbols in the master bedroom. They seem to be part of a ritual."),
        timeProgression: 1,
        visualEffect: 'distort'
    },
    decipherSymbols: {
        text: "You force yourself to focus, despite the pain in your mind. The symbols reveal a chilling truth: the house is a living entity, feeding on fear. The ritual is not to banish, but to awaken something dormant. You see a vision of a hidden passage behind the fireplace, but it's not the 'true' exit. It's a way to the house's heart.",
        choices: [
            { text: "Go to the fireplace (House's Heart)", nextScene: 'houseHeartEntry', sanityChange: -40 },
            { text: "Try to find the 'true' exit (if you have the journal)", nextScene: 'trueExit', sanityChange: -10, required: { hasJournal: true } }
        ],
        onEnter: () => addJournalEntry("Deciphered the symbols! The house is alive. There's a passage to its 'heart' behind the fireplace, distinct from the 'true' exit."),
        timeProgression: 1,
        visualEffect: 'grayscale'
    },
    searchMasterBedroom: {
        text: "You meticulously search the master bedroom. Under a loose floorboard near the bed, you find a small, intricately carved wooden box. It's locked. You also notice a faint, almost invisible, inscription on the back of the headboard.",
        choices: [
            { text: "Examine the wooden box", nextScene: 'woodenBox', sanityChange: -5 },
            { text: "Examine the inscription", nextScene: 'inscription', sanityChange: -5 },
            { text: "Return to the hallway", nextScene: 'hallway', sanityChange: -2 }
        ],
        timeProgression: 1
    },
    woodenBox: {
        text: "The wooden box is beautifully crafted, but its lock is complex. It seems to require a specific sequence of touches or a very unique key. It radiates a faint, cold energy.",
        choices: [
            { text: "Try to force it open (risky)", nextScene: 'forceWoodenBox', sanityChange: -15 },
            { text: "Look for a key (if you have the key)", nextScene: 'useKeyOnBox', sanityChange: 0, required: { hasKey: true } },
            { text: "Leave it for now", nextScene: 'masterBedroom', sanityChange: 0 }
        ],
        timeProgression: 0
    },
    forceWoodenBox: {
        text: "You try to force the box open. A sharp, piercing sound emanates from it, and your hands feel as if they're being burned by ice. The box shudders, and a dark, ethereal smoke billows from its seams, engulfing you.",
        choices: [],
        end: { type: 'bad', message: "The smoke fills your lungs, freezing you from the inside out. You become a frozen statue, a part of the house's dark collection. ENDING: The Frozen Soul." },
        timeProgression: 1,
        visualEffect: 'fadeOut'
    },
    useKeyOnBox: {
        text: "You insert the ornate key you found earlier. It slides in perfectly, and with a soft click, the box opens. Inside, you find a single, glowing crystal. It pulses with a warm, comforting light, pushing back the shadows. Your sanity feels restored.",
        choices: [
            { text: "Take the crystal", nextScene: 'takeCrystal', sanityChange: 20 },
            { text: "Leave the crystal", nextScene: 'masterBedroom', sanityChange: 0 }
        ],
        onEnter: () => addJournalEntry("The ornate key opened a hidden box! Found a glowing crystal. It feels... protective."),
        timeProgression: 0
    },
    takeCrystal: {
        text: "You take the crystal. Its warmth spreads through your body, and the oppressive atmosphere of the house seems to recede slightly. You feel a renewed sense of purpose. The house still groans, but its power over you lessens.",
        choices: [
            { text: "Return to the hallway, feeling stronger", nextScene: 'hallway', sanityChange: 10 },
            { text: "Search the room again with new hope", nextScene: 'searchMasterBedroom', sanityChange: 5 }
        ],
        timeProgression: 0
    },
    inscription: {
        text: "The inscription on the headboard is written in an ancient, flowing script. It speaks of 'the guardian's slumber' and 'the light that breaks the curse.' It mentions a specific sequence of actions required to 'awaken the guardian' and find true peace.",
        choices: [
            { text: "Try to interpret the sequence", nextScene: 'interpretInscription', sanityChange: -10, requiredSanity: sanityThresholds.medium },
            { text: "Leave it alone", nextScene: 'masterBedroom', sanityChange: -2 }
        ],
        onEnter: () => addJournalEntry("Found an inscription on the headboard. Mentions 'the guardian' and a 'sequence of actions' for peace."),
        timeProgression: 0
    },
    interpretInscription: {
        text: "You focus, trying to make sense of the cryptic words. The sequence seems to involve interacting with specific elements in the house in a certain order: the locket, the fireplace, and then the master bedroom symbols. If done correctly, it promises 'release'.",
        choices: [
            { text: "Attempt the ritual of release (requires locket, journal)", nextScene: 'ritualOfRelease', sanityChange: 30, required: { hasLocket: true, hasJournal: true } },
            { text: "Go back to the hallway", nextScene: 'hallway', sanityChange: -5 }
        ],
        onEnter: () => addJournalEntry("Deciphered the inscription: a ritual involving the locket, fireplace, and master bedroom symbols to awaken a 'guardian' and find peace."),
        timeProgression: 1
    },
    ritualOfRelease: {
        text: "Following the inscription, you hold the locket, touch the fireplace, and then the master bedroom symbols in the correct order. The house begins to hum, a deep, resonant vibration that shakes the very foundations. A blinding white light erupts from the symbols, engulfing you. When it fades, you are standing outside, the house a silent, crumbling ruin behind you.",
        choices: [],
        end: { type: 'good', message: "The guardian's peace is yours. The house, its malevolence broken, crumbles into dust. You are truly free. ENDING: The Guardian's Peace." },
        timeProgression: 1,
        visualEffect: 'fadeIn'
    },
    houseHeartEntry: {
        text: "You return to the fireplace, knowing what lies beyond. The brick slides open, revealing a pulsating, dark maw. This is the house's heart, the source of its terror. You feel an irresistible pull, a morbid fascination.",
        choices: [
            { text: "Enter the heart of the house", nextScene: 'houseHeart', sanityChange: -50 },
            { text: "Turn back (if you still can)", nextScene: 'hallway', sanityChange: -10, requiredSanity: sanityThresholds.low }
        ],
        timeProgression: 1,
        visualEffect: 'distort'
    },
    houseHeart: {
        text: "You step into the pulsating darkness. The air is thick with despair and ancient fear. Walls of flesh and bone surround you, throbbing with a sickening rhythm. Whispers echo from every surface, telling tales of madness and suffering. You are at the core of the house's evil. There is no escape now.",
        choices: [
            { text: "Confront the core (requires high sanity)", nextScene: 'confrontCore', sanityChange: -70, requiredSanity: sanityThresholds.high },
            { text: "Succumb to the despair", nextScene: 'succumb', sanityChange: -100 }
        ],
        timeProgression: 1,
        visualEffect: 'grayscale'
    },
    confrontCore: {
        text: "Despite the overwhelming horror, you stand firm. You focus your will, pushing back against the malevolence. The core of the house screams, a sound that tears at the fabric of reality. You feel its power, its ancient sorrow, and its endless hunger. You see a momentary flicker, a weakness.",
        choices: [
            { text: "Strike at the weakness (requires flashlight)", nextScene: 'strikeWeakness', sanityChange: -80, required: { hasFlashlight: true } },
            { text: "Try to reason with it (futile)", nextScene: 'succumb', sanityChange: -100 }
        ],
        timeProgression: 1,
        visualEffect: 'shake'
    },
    strikeWeakness: {
        text: "You aim the feeble beam of your flashlight at the flickering weakness. The light, though small, is anathema to the darkness. The house's heart shudders, then bursts, releasing a torrent of black, viscous fluid. You are flung back, landing outside the house as it collapses into a pile of dust and rubble.",
        choices: [],
        end: { type: 'good', message: "The house is destroyed, its evil banished forever. You are battered but alive, a true survivor. ENDING: The Destroyer." },
        timeProgression: 1,
        visualEffect: 'fadeOut'
    },
    succumb: {
        text: "The despair is too great. You feel your will draining away, replaced by an emptiness that mirrors the house's hunger. You become one with the pulsating darkness, another voice in its endless chorus of suffering.",
        choices: [],
        end: { type: 'bad', message: "You are absorbed into the house's core, your consciousness extinguished, your fear feeding its eternal life. ENDING: The Sacrifice." },
        timeProgression: 1,
        visualEffect: 'fadeOut'
    },
    sanityBreak: {
        text: "Your mind snaps. The world around you twists into a grotesque parody of reality. Shadows writhe, whispers become screams, and the very air crackles with unseen horrors. You are no longer in control. The house has won.",
        choices: [],
        end: { type: 'bad', message: "Your sanity is utterly shattered. You wander the house's endless corridors, a living ghost, forever lost in its madness. ENDING: Descent into Madness." },
        timeProgression: 0,
        visualEffect: 'grayscale'
    },
    gameOver: {
        text: "The game has ended. " + (gameState.lastEndingMessage || "An unknown fate befell you."),
        choices: [
            { text: "Play Again", nextScene: 'intro', resetGame: true } // Restart to intro
        ],
        timeProgression: 0
    }
};

let typingTimeout;
let cursorBlinkTimeout;

function updateSanity(change) {
    gameState.sanityLevel = Math.max(0, Math.min(100, gameState.sanityLevel + change));
    updateSanityDisplay();
    if (gameState.sanityLevel <= sanityThresholds.critical && gameState.currentScene !== 'sanityBreak' && gameState.currentScene !== 'gameOver') {
        loadScene('sanityBreak');
    }
}

function updateSanityDisplay() {
    sanityBarFill.style.width = `${gameState.sanityLevel}%`;
    sanityLevelDisplay.textContent = `${gameState.sanityLevel}%`;

    if (gameState.sanityLevel > sanityThresholds.high) {
        sanityBarFill.style.backgroundColor = '#28a745'; // Green
        sanityLevelDisplay.style.color = '#fff';
    } else if (gameState.sanityLevel > sanityThresholds.medium) {
        sanityBarFill.style.backgroundColor = '#ffc107'; // Yellow
        sanityLevelDisplay.style.color = '#333';
    } else if (gameState.sanityLevel > sanityThresholds.low) {
        sanityBarFill.style.backgroundColor = '#fd7e14'; // Orange
        sanityLevelDisplay.style.color = '#fff';
    } else {
        sanityBarFill.style.backgroundColor = '#dc3545'; // Red
        sanityLevelDisplay.style.color = '#fff';
        sanityLevelDisplay.classList.add('flicker');
    }
    if (gameState.sanityLevel > sanityThresholds.low) {
        sanityLevelDisplay.classList.remove('flicker');
    }
}

function updateTime(progression) {
    gameState.timeOfDay = (gameState.timeOfDay + progression) % timeNames.length;
    timeDisplay.textContent = `Time: Day 1 - ${timeNames[gameState.timeOfDay]}`;
}

function addJournalEntry(entryText) {
    const entryDiv = document.createElement('div');
    entryDiv.classList.add('journal-entry');
    entryDiv.textContent = `- ${entryText}`;
    journalEntriesContainer.prepend(entryDiv); // Add to the top
    gameState.journalEntries.push(entryText); // Keep track in state
}

function toggleJournal() {
    if (journalPanel.classList.contains('journal-open')) {
        journalPanel.classList.remove('journal-open');
        // Wait for fade-out transition before setting display: none
        setTimeout(() => { journalPanel.style.display = 'none'; }, 500);
    } else {
        // Clear and repopulate journal entries every time it opens
        journalEntriesContainer.innerHTML = '';
        gameState.journalEntries.slice().reverse().forEach(entryText => { // Reverse to show newest first
            const entryDiv = document.createElement('div');
            entryDiv.classList.add('journal-entry');
            entryDiv.textContent = `- ${entryText}`;
            journalEntriesContainer.appendChild(entryDiv); // Append to build from top down for already existing entries
        });

        journalPanel.style.display = 'flex'; // Set display:flex immediately
        // Allow a tiny moment for display change to apply before starting opacity transition
        setTimeout(() => { journalPanel.classList.add('journal-open'); }, 10);
    }
}

journalButton.addEventListener('click', toggleJournal);
closeJournalButton.addEventListener('click', toggleJournal);

function showMessageBox(message, callback) {
    messageText.textContent = message;
    messageBox.style.display = 'block'; // Set display immediately
    setTimeout(() => { // Allow display change to apply before starting opacity transition
        messageBox.classList.add('message-open');
    }, 10);
    messageOkButton.onclick = () => {
        messageBox.classList.remove('message-open');
        setTimeout(() => { // Wait for fade-out transition
            messageBox.style.display = 'none';
            if (callback) callback();
        }, 300);
    };
}

function loadScene(sceneName) {
    const scene = scenes[sceneName];
    if (!scene) {
        console.error("Scene not found:", sceneName);
        return;
    }

    if (scene.required) {
        for (const [key, value] of Object.entries(scene.required)) {
            if (gameState[key] !== value) {
                showMessageBox("You lack the necessary item or condition for this action. Try something else.", () => loadScene(gameState.currentScene));
                return;
            }
        }
    }

    if (scene.requiredSanity !== undefined && gameState.sanityLevel < scene.requiredSanity) {
        showMessageBox("Your sanity is too low for this action. You cannot bring yourself to do it.", () => loadScene(gameState.currentScene));
        return;
    }

    if (scene.end) {
        gameState.lastEndingMessage = scene.end.message;
        endGame(scene.end.message, scene.end.type);
        if (scene.visualEffect) applyVisualEffect(scene.visualEffect);
        return;
    }

    if (gameState.sanityLevel <= sanityThresholds.critical && sceneName !== 'sanityBreak' && sceneName !== 'gameOver') {
        loadScene('sanityBreak');
        return;
    }

    gameState.currentScene = sceneName;

    if (scene.timeProgression !== undefined) {
        updateTime(scene.timeProgression);
    }

    gameTextElement.textContent = '';
    gameTextElement.classList.remove('text-reveal');
    void gameTextElement.offsetWidth;
    gameTextElement.classList.add('text-reveal');
    typeWriter(scene.text);

    choicesContainer.innerHTML = '';
    scene.choices.forEach(choice => {
        const button = document.createElement('button');
        button.classList.add('choice-button');
        if (choice.altStyle) {
            button.classList.add('button-alt');
        }
        button.textContent = choice.text;
        button.addEventListener('click', () => makeChoice(choice));
        choicesContainer.appendChild(button);
    });

    if (scene.visualEffect) {
        applyVisualEffect(scene.visualEffect);
    } else {
        removeVisualEffects();
    }

    if (scene.onEnter) {
        scene.onEnter();
    }
    updateSanityDisplay();

    // Hide journal button on intro scene
    if (sceneName === 'intro') {
        journalButton.classList.add('hidden');
    } else {
        journalButton.classList.remove('hidden');
    }
}

function makeChoice(choice) {
    if (choice.sanityChange !== undefined) {
        updateSanity(choice.sanityChange);
    }

    if (choice.resetGame) {
        resetGame();
        return;
    }
    loadScene(choice.nextScene);
}

function typeWriter(text, i = 0) {
    clearTimeout(typingTimeout);
    clearTimeout(cursorBlinkTimeout);
    typingCursor.style.opacity = 1;
    typingCursor.style.animation = 'none';

    if (i < text.length) {
        gameTextElement.textContent += text.charAt(i);
        typingTimeout = setTimeout(() => typeWriter(text, i + 1), 20);
    } else {
        typingCursor.style.animation = 'blink-caret 0.75s step-end infinite';
    }
}

function applyVisualEffect(effectName) {
    overlayEffects.classList.remove('effect-static', 'effect-blur', 'effect-grayscale', 'effect-distort', 'effect-vignette');
    gameContainer.classList.remove('shake', 'fadeOut');
    gameTitle.classList.remove('flicker', 'shake', 'fadeOut');
    void overlayEffects.offsetWidth;
    void gameContainer.offsetWidth;
    void gameTitle.offsetWidth;

    if (effectName === 'flicker') {
        gameTitle.classList.add('flicker');
    } else if (effectName === 'shake') {
        gameContainer.classList.add('shake');
    } else if (effectName === 'fadeOut') {
        gameContainer.classList.add('fadeOut');
        gameTitle.classList.add('fadeOut');
        overlayEffects.classList.add('fadeOut');
    } else if (effectName === 'static') {
        overlayEffects.classList.add('effect-static');
    } else if (effectName === 'blur') {
        overlayEffects.classList.add('effect-blur');
    } else if (effectName === 'grayscale') {
        overlayEffects.classList.add('effect-grayscale');
    } else if (effectName === 'distort') {
        overlayEffects.classList.add('effect-distort');
    } else if (effectName === 'vignette') {
        overlayEffects.classList.add('effect-vignette');
    }
}

function removeVisualEffects() {
    overlayEffects.classList.remove('effect-static', 'effect-blur', 'effect-grayscale', 'effect-distort', 'effect-vignette', 'fadeOut');
    gameContainer.classList.remove('shake', 'fadeOut');
    gameTitle.classList.remove('flicker', 'shake', 'fadeOut');
}

function endGame(message, type) {
    clearTimeout(typingTimeout);
    clearTimeout(cursorBlinkTimeout);
    typingCursor.style.opacity = 0;

    gameTextElement.textContent = '';
    gameTextElement.classList.remove('text-reveal');
    void gameTextElement.offsetWidth;
    gameTextElement.classList.add('text-reveal');
    typeWriter(message);

    choicesContainer.innerHTML = '';
    const restartButton = document.createElement('button');
    restartButton.classList.add('choice-button');
    restartButton.textContent = "Restart Game";
    restartButton.addEventListener('click', resetGame); // Call resetGame directly
    choicesContainer.appendChild(restartButton);

    gameState.currentScene = 'gameOver';
    journalButton.classList.add('hidden'); // Hide journal button on game over
}

function resetGame() {
    gameState = {
        currentScene: 'intro', // Reset to intro scene
        sanityLevel: 100,
        hasKey: false,
        hasFlashlight: false,
        hasLocket: false,
        hasJournal: false,
        timeOfDay: 0,
        journalEntries: [],
        lastEndingMessage: ""
    };
    journalEntriesContainer.innerHTML = ''; // Clear journal entries display
    removeVisualEffects();
    journalButton.classList.remove('hidden'); // Ensure journal button is visible for next game
    loadScene('intro'); // Load the intro scene
    updateSanityDisplay(); // Update sanity display
    updateTime(0); // Reset and update time display
}

document.addEventListener('DOMContentLoaded', () => {
    loadScene('intro'); // Game starts with intro scene
    updateSanityDisplay();
    updateTime(0); // Initialize time display
});