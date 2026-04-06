import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Star, RotateCcw, Lock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { KidProfile } from '../../types';
import { soundManager } from '../../lib/sound-utils';

interface Props {
  kid: KidProfile;
  onComplete: (stars: number) => void;
}

// 50 UNIQUE STORIES
const STORIES = [
  { title: 'The Hungry Frog', panels: [{ order: 1, emoji: '🐸', text: 'A green frog sits patiently on a lily pad.' }, { order: 2, emoji: '🦟', text: 'He spots a delicious, buzzing mosquito.' }, { order: 3, emoji: '👅', text: 'He quickly snaps his long, sticky tongue!' }, { order: 4, emoji: '😋', text: 'The frog rubs his belly, feeling full.' }] },
  { title: 'The Little Seed', panels: [{ order: 1, emoji: '🌱', text: 'A tiny seed is planted deep in the soil.' }, { order: 2, emoji: '🌧️', text: 'Gentle raindrops water the thirsty seed.' }, { order: 3, emoji: '☀️', text: 'The bright sun warms the damp earth.' }, { order: 4, emoji: '🌸', text: 'A gorgeous pink flower blooms wonderfully!' }] },
  { title: 'Bedtime for Bear', panels: [{ order: 1, emoji: '🐻', text: 'A brown bear plays outside all afternoon.' }, { order: 2, emoji: '🍯', text: 'He eats sticky, sweet honey for dinner.' }, { order: 3, emoji: '🛁', text: 'He takes a warm, relaxing bubble bath.' }, { order: 4, emoji: '😴', text: 'The bear falls fast asleep in his cozy bed.' }] },
  { title: 'The Lost Duckling', panels: [{ order: 1, emoji: '🐤', text: 'A curious duckling wanders away from home.' }, { order: 2, emoji: '😢', text: 'He feels scared because he cannot find Mama.' }, { order: 3, emoji: '🔍', text: 'He searches through the tall, green reeds.' }, { order: 4, emoji: '🦆', text: 'Mama duck happily finds her little baby!' }] },
  { title: 'Caterpillar Magic', panels: [{ order: 1, emoji: '🐛', text: 'A fuzzy caterpillar eats green leaves.' }, { order: 2, emoji: '🌿', text: 'He spins a safe, silky chrysalis.' }, { order: 3, emoji: '⏳', text: 'He rests inside for many long days.' }, { order: 4, emoji: '🦋', text: 'He emerges as a beautiful butterfly!' }] },
  { title: 'The Busy Ant', panels: [{ order: 1, emoji: '🐜', text: 'A tiny ant finds a giant breadcrumb.' }, { order: 2, emoji: '💪', text: 'He lifts the heavy crumb with all his might.' }, { order: 3, emoji: '🚶‍♂️', text: 'He marches straight back to the anthill.' }, { order: 4, emoji: '🐜🐜', text: 'He happily shares the food with his friends.' }] },
  { title: 'Bird Builds a Nest', panels: [{ order: 1, emoji: '🐦', text: 'A robin searches for strong twigs.' }, { order: 2, emoji: '🌳', text: 'She carries the twigs high into a tree.' }, { order: 3, emoji: '🪺', text: 'She weaves them together into a round nest.' }, { order: 4, emoji: '🥚', text: 'She safely lays three little blue eggs.' }] },
  { title: 'Spider\'s Web', panels: [{ order: 1, emoji: '🕷️', text: 'A black spider climbs to a tall branch.' }, { order: 2, emoji: '🕸️', text: 'She carefully spins a sticky, glowing web.' }, { order: 3, emoji: '🪰', text: 'A clumsy fly gets caught in the threads.' }, { order: 4, emoji: '🍽️', text: 'The spider enjoys a tasty midnight snack.' }] },

  // Daily Routines
  { title: 'Morning Routine', panels: [{ order: 1, emoji: '🌅', text: 'The bright sun rises in the morning sky.' }, { order: 2, emoji: '🥱', text: 'I stretch my arms and yawn sleepily.' }, { order: 3, emoji: '🪥', text: 'I thoroughly brush my teeth until they shine.' }, { order: 4, emoji: '👕', text: 'I put on clean clothes for the day.' }] },
  { title: 'Baking Cookies', panels: [{ order: 1, emoji: '🥣', text: 'We mix sugar, flour, and butter in a bowl.' }, { order: 2, emoji: '🥄', text: 'We stir in dark chocolate chips.' }, { order: 3, emoji: '♨️', text: 'We bake them inside the hot oven.' }, { order: 4, emoji: '🍪', text: 'We eat warm, chewy cookies with milk!' }] },
  { title: 'Making Pizza', panels: [{ order: 1, emoji: '🥖', text: 'We roll the soft dough into a big circle.' }, { order: 2, emoji: '🍅', text: 'We spread red tomato sauce everywhere.' }, { order: 3, emoji: '🧀', text: 'We sprinkle lots of gooey cheese on top.' }, { order: 4, emoji: '🍕', text: 'We slice the hot pizza and eat it up!' }] },
  { title: 'Washing the Dog', panels: [{ order: 1, emoji: '🐕', text: 'The dog rolls in a muddy puddle.' }, { order: 2, emoji: '🛁', text: 'We put the dirty dog into the bathtub.' }, { order: 3, emoji: '🧼', text: 'We scrub his fur with bubbly soap.' }, { order: 4, emoji: '✨', text: 'The dog is finally fluffy and clean!' }] },
  { title: 'Doing Laundry', panels: [{ order: 1, emoji: '🧺', text: 'We gather all the dirty, smelly clothes.' }, { order: 2, emoji: '🫧', text: 'We put them in the soapy washing machine.' }, { order: 3, emoji: '☀️', text: 'We hang the wet clothes outside to dry.' }, { order: 4, emoji: '👕', text: 'We fold the fresh, clean shirts neatly.' }] },
  { title: 'Going to School', panels: [{ order: 1, emoji: '🎒', text: 'I pack my heavy books into my backpack.' }, { order: 2, emoji: '🚌', text: 'I ride the big yellow bus through town.' }, { order: 3, emoji: '🏫', text: 'I walk inside the brick school building.' }, { order: 4, emoji: '📚', text: 'I sit at my desk and learn new things.' }] },
  { title: 'Library Trip', panels: [{ order: 1, emoji: '🏢', text: 'We visit the quiet, peaceful library.' }, { order: 2, emoji: '📖', text: 'I search the shelves for a storybook.' }, { order: 3, emoji: '👩‍🏫', text: 'The librarian scans my reading card.' }, { order: 4, emoji: '🛋️', text: 'I sit on the rug and read my new book.' }] },

  // Occupations & Vehicles
  { title: 'The Brave Firefighter', panels: [{ order: 1, emoji: '🚨', text: 'The loud fire alarm rings at the station.' }, { order: 2, emoji: '🚒', text: 'The firefighters drive the fast red truck.' }, { order: 3, emoji: '💦', text: 'They spray cold water from a heavy hose.' }, { order: 4, emoji: '🔥', text: 'They successfully put out the dangerous fire!' }] },
  { title: 'The Police Officer', panels: [{ order: 1, emoji: '👮', text: 'The officer puts on a shiny blue uniform.' }, { order: 2, emoji: '🚓', text: 'He patrols the neighborhood in his car.' }, { order: 3, emoji: '🚦', text: 'He helps direct traffic at a broken light.' }, { order: 4, emoji: '👍', text: 'He keeps the city safe and peaceful.' }] },
  { title: 'The Helpful Doctor', panels: [{ order: 1, emoji: '🏥', text: 'A sick patient arrives at the hospital.' }, { order: 2, emoji: '🩺', text: 'The doctor listens to the patient\'s heart.' }, { order: 3, emoji: '💊', text: 'She gives the patient some helpful medicine.' }, { order: 4, emoji: '😊', text: 'The patient feels healthy and strong again.' }] },
  { title: 'The Farmer', panels: [{ order: 1, emoji: '🚜', text: 'The farmer drives his loud, green tractor.' }, { order: 2, emoji: '🌱', text: 'He plants tiny seeds in the dark dirt.' }, { order: 3, emoji: '🌾', text: 'The tall wheat grows high in the sun.' }, { order: 4, emoji: '🥖', text: 'He harvests the wheat to make bread.' }] },
  { title: 'The Astronaut', panels: [{ order: 1, emoji: '🧑‍🚀', text: 'The astronaut puts on a heavy white suit.' }, { order: 2, emoji: '🚀', text: 'The rocket blasts off into the starry sky.' }, { order: 3, emoji: '🌌', text: 'He floats weightlessly in outer space.' }, { order: 4, emoji: '🌕', text: 'He plants a flag on the bumpy moon.' }] },
  { title: 'The Pilot', panels: [{ order: 1, emoji: '✈️', text: 'Passengers board the massive airplane.' }, { order: 2, emoji: '🛫', text: 'The pilot steers the plane down the runway.' }, { order: 3, emoji: '☁️', text: 'The plane soars high above the white clouds.' }, { order: 4, emoji: '🛬', text: 'The pilot lands safely in a new city.' }] },
  { title: 'The Builder', panels: [{ order: 1, emoji: '🏗️', text: 'A massive crane lifts heavy steel beams.' }, { order: 2, emoji: '🧱', text: 'Builders lay red bricks with sticky cement.' }, { order: 3, emoji: '🔨', text: 'They hammer the wooden roof into place.' }, { order: 4, emoji: '🏠', text: 'A brand new house is finally finished.' }] },
  { title: 'Train Journey', panels: [{ order: 1, emoji: '🚉', text: 'Travelers buy tickets at the busy station.' }, { order: 2, emoji: '🚂', text: 'The locomotive blows a loud steam whistle.' }, { order: 3, emoji: '🛤️', text: 'The train speeds along the iron tracks.' }, { order: 4, emoji: '👋', text: 'Passengers wave goodbye as they leave.' }] },

  // Fantasy & Magic
  { title: 'The Knight\'s Quest', panels: [{ order: 1, emoji: '🤺', text: 'A brave knight puts on shining armor.' }, { order: 2, emoji: '🐴', text: 'He rides his trusty horse into the forest.' }, { order: 3, emoji: '🐉', text: 'He discovers a fire-breathing dragon.' }, { order: 4, emoji: '🤝', text: 'He becomes friends with the gentle beast.' }] },
  { title: 'The Magic Wand', panels: [{ order: 1, emoji: '🧙‍♂️', text: 'A wise wizard finds a glowing wooden wand.' }, { order: 2, emoji: '📖', text: 'He reads a spell from an ancient book.' }, { order: 3, emoji: '🪄', text: 'He waves the wand and shouts magic words.' }, { order: 4, emoji: '🐇', text: 'A white rabbit pops out of his hat!' }] },
  { title: 'Pirate Treasure', panels: [{ order: 1, emoji: '🏴‍☠️', text: 'A pirate ship sails across the ocean.' }, { order: 2, emoji: '🗺️', text: 'The captain reads a torn treasure map.' }, { order: 3, emoji: '🏝️', text: 'They dock the ship at a deserted island.' }, { order: 4, emoji: '💎', text: 'They dig up a chest full of shiny gold.' }] },
  { title: 'Mermaid\'s Pearl', panels: [{ order: 1, emoji: '🧜‍♀️', text: 'A beautiful mermaid swims in the sea.' }, { order: 2, emoji: '🐚', text: 'She finds a giant, purple seashell.' }, { order: 3, emoji: '👐', text: 'She carefully opens the heavy shell.' }, { order: 4, emoji: '⚪', text: 'She discovers a glowing, magical pearl.' }] },
  { title: 'The Friendly Alien', panels: [{ order: 1, emoji: '🛸', text: 'A silver UFO lands in the backyard.' }, { order: 2, emoji: '👽', text: 'A green alien steps out with a wave.' }, { order: 3, emoji: '🍪', text: 'We offer him some fresh chocolate cookies.' }, { order: 4, emoji: '🚀', text: 'He flies back to his home planet happily.' }] },

  // Weather & Seasons
  { title: 'Winter Snowman', panels: [{ order: 1, emoji: '❄️', text: 'Soft snow falls quietly from the sky.' }, { order: 2, emoji: '⛄', text: 'We roll three giant balls of cold snow.' }, { order: 3, emoji: '🥕', text: 'We give him a carrot nose and a hat.' }, { order: 4, emoji: '🧣', text: 'We wrap a warm scarf around his neck.' }] },
  { title: 'Spring Rain', panels: [{ order: 1, emoji: '☁️', text: 'Dark grey clouds roll into the sky.' }, { order: 2, emoji: '🌧️', text: 'Heavy rain pours down on the town.' }, { order: 3, emoji: '🌂', text: 'We open our colorful umbrellas.' }, { order: 4, emoji: '🌈', text: 'A bright rainbow appears after the storm.' }] },
  { title: 'Autumn Leaves', panels: [{ order: 1, emoji: '🍁', text: 'The green tree leaves turn orange and red.' }, { order: 2, emoji: '🌬️', text: 'A chilly wind blows the leaves down.' }, { order: 3, emoji: '🍂', text: 'We rake them into a massive pile.' }, { order: 4, emoji: '🏃‍♂️', text: 'We jump right into the crunchy leaves!' }] },
  { title: 'Summer Beach', panels: [{ order: 1, emoji: '☀️', text: 'The sun shines fiercely in the summer.' }, { order: 2, emoji: '🏖️', text: 'We pack a heavy cooler and head to the beach.' }, { order: 3, emoji: '🌊', text: 'We splash around in the salty ocean waves.' }, { order: 4, emoji: '🍦', text: 'We eat freezing cold ice cream cones.' }] },

  // Fun & Games
  { title: 'Flying a Kite', panels: [{ order: 1, emoji: '🪁', text: 'We build a diamond kite with strong string.' }, { order: 2, emoji: '🏃', text: 'We run fast across the grassy park.' }, { order: 3, emoji: '💨', text: 'The strong breeze lifts the kite up high.' }, { order: 4, emoji: '☁️', text: 'It dances merrily among the white clouds.' }] },
  { title: 'Playing Soccer', panels: [{ order: 1, emoji: '⚽', text: 'The referee blows his whistle to start.' }, { order: 2, emoji: '👟', text: 'The player dribbles the ball down the field.' }, { order: 3, emoji: '🥅', text: 'She kicks it hard toward the goalie.' }, { order: 4, emoji: '🎉', text: 'She scores a goal and the crowd cheers!' }] },
  { title: 'Camping Trip', panels: [{ order: 1, emoji: '⛺', text: 'We set up our green tent in the woods.' }, { order: 2, emoji: '🔥', text: 'We build a warm, crackling campfire.' }, { order: 3, emoji: '🌭', text: 'We roast hot dogs on long wooden sticks.' }, { order: 4, emoji: '🌌', text: 'We look up at the beautiful starry night.' }] },
  { title: 'Birthday Party', panels: [{ order: 1, emoji: '🎈', text: 'We blow up colorful balloons for the party.' }, { order: 2, emoji: '🎁', text: 'Friends arrive carrying wrapped presents.' }, { order: 3, emoji: '🎂', text: 'We light candles on the frosted cake.' }, { order: 4, emoji: '🥳', text: 'We sing happy birthday and eat dessert!' }] },
  { title: 'Going Fishing', panels: [{ order: 1, emoji: '🚣', text: 'We row our wooden boat into the lake.' }, { order: 2, emoji: '🎣', text: 'We cast our fishing lines into the water.' }, { order: 3, emoji: '🐟', text: 'A big fish suddenly bites the hook!' }, { order: 4, emoji: '📸', text: 'We take a picture and throw the fish back.' }] },
  { title: 'Amusement Park', panels: [{ order: 1, emoji: '🎟️', text: 'We buy tickets at the front gate.' }, { order: 2, emoji: '🎢', text: 'We strap into a giant roller coaster.' }, { order: 3, emoji: '😱', text: 'We scream as we drop down the steep hill.' }, { order: 4, emoji: '🍭', text: 'We buy pink cotton candy before we leave.' }] },

  // Music & Art
  { title: 'Painting a Picture', panels: [{ order: 1, emoji: '🎨', text: 'I squeeze colorful paints onto my palette.' }, { order: 2, emoji: '🖌️', text: 'I dip my brush into bright blue paint.' }, { order: 3, emoji: '🖼️', text: 'I paint a beautiful landscape on the canvas.' }, { order: 4, emoji: '👏', text: 'My mom proudly hangs it on the wall.' }] },
  { title: 'The Concert', panels: [{ order: 1, emoji: '🎸', text: 'The musician tunes his wooden guitar.' }, { order: 2, emoji: '🎤', text: 'He steps up to the loud microphone.' }, { order: 3, emoji: '🎶', text: 'He strums the strings and sings a melody.' }, { order: 4, emoji: '👏👏', text: 'The happy audience claps their hands.' }] },

  // More Random Fun
  { title: 'Losing a Tooth', panels: [{ order: 1, emoji: '😬', text: 'My front tooth feels very loose.' }, { order: 2, emoji: '🍎', text: 'I bite into an apple and it falls out!' }, { order: 3, emoji: '🛌', text: 'I put the tooth under my soft pillow.' }, { order: 4, emoji: '🪙', text: 'The Tooth Fairy leaves a shiny coin.' }] },
  { title: 'Making a Potion', panels: [{ order: 1, emoji: '🧪', text: 'The scientist pours green liquid in a tube.' }, { order: 2, emoji: '💧', text: 'She adds three drops of purple water.' }, { order: 3, emoji: '💥', text: 'The mixture bubbles and suddenly pops!' }, { order: 4, emoji: '📝', text: 'She writes down the amazing results.' }] },
  { title: 'The Race', panels: [{ order: 1, emoji: '🏁', text: 'The runners line up at the starting line.' }, { order: 2, emoji: '🏃', text: 'They sprint incredibly fast around the track.' }, { order: 3, emoji: '🥵', text: 'They breathe heavily, feeling very tired.' }, { order: 4, emoji: '🥇', text: 'The winner proudly receives a gold medal.' }] },
  { title: 'Car Wash', panels: [{ order: 1, emoji: '🚗', text: 'Our car is covered in thick, brown mud.' }, { order: 2, emoji: '🧽', text: 'We scrub the doors with big, soapy sponges.' }, { order: 3, emoji: '🚿', text: 'We rinse the soap off with a garden hose.' }, { order: 4, emoji: '😎', text: 'The car looks brand new and shiny.' }] },
  { title: 'Getting Ice Cream', panels: [{ order: 1, emoji: '🍦', text: 'We wait in line at the ice cream truck.' }, { order: 2, emoji: '💵', text: 'We hand the driver some crinkled money.' }, { order: 3, emoji: '🍨', text: 'He scoops vanilla and chocolate into a cone.' }, { order: 4, emoji: '😋', text: 'We eat it quickly before it melts!' }] },
  { title: 'The Picnic', panels: [{ order: 1, emoji: '🧺', text: 'We pack sandwiches and fruit in a basket.' }, { order: 2, emoji: '🌳', text: 'We spread a blanket under a shady tree.' }, { order: 3, emoji: '🥪', text: 'We eat our tasty lunch in the park.' }, { order: 4, emoji: '🐜', text: 'Sneaky ants try to steal our crumbs!' }] },
  { title: 'Building a Fort', panels: [{ order: 1, emoji: '🛋️', text: 'We pull the cushions off the living room sofa.' }, { order: 2, emoji: '🛏️', text: 'We drape heavy blankets over the chairs.' }, { order: 3, emoji: '🔦', text: 'We crawl inside with a bright flashlight.' }, { order: 4, emoji: '📖', text: 'We read ghost stories in our secret base.' }] },
  { title: 'Growing a Tomato', panels: [{ order: 1, emoji: '🕳️', text: 'I dig a small hole in the garden dirt.' }, { order: 2, emoji: '🪴', text: 'I place a small green plant inside.' }, { order: 3, emoji: '☀️', text: 'Weeks of sunshine make the plant grow big.' }, { order: 4, emoji: '🍅', text: 'I pick a massive, juicy red tomato.' }] },
  { title: 'The Skateboarder', panels: [{ order: 1, emoji: '🛹', text: 'A boy stands on his wooden skateboard.' }, { order: 2, emoji: '🦵', text: 'He kicks his foot to roll forward fast.' }, { order: 3, emoji: '🎢', text: 'He rides up a steep concrete ramp.' }, { order: 4, emoji: '✨', text: 'He flips the board perfectly in the air.' }] },
  { title: 'Shopping Trip', panels: [{ order: 1, emoji: '🛒', text: 'We grab a metal cart at the grocery store.' }, { order: 2, emoji: '🥦', text: 'We fill it with healthy green vegetables.' }, { order: 3, emoji: '💳', text: 'We pay for our food at the cash register.' }, { order: 4, emoji: '🛍️', text: 'We carry the heavy bags into the kitchen.' }] }
];

function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

type Panel = typeof STORIES[0]['panels'][0];

export default function StorySequencingGame({ kid, onComplete }: Props) {
  // Safe initializations
  const [gameSequence, setGameSequence] = useState(() => shuffleArray(STORIES));
  const [storyIndex, setStoryIndex] = useState(0);

  // Reverted to click-to-move arrays!
  const [placed, setPlaced] = useState<Panel[]>([]);
  const [available, setAvailable] = useState<Panel[]>([]);

  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  // Advanced Features State
  const [isChecking, setIsChecking] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [readingIndex, setReadingIndex] = useState<number | null>(null);

  const isMounted = useRef(true);
  const current = gameSequence[storyIndex];

  const cleanup = () => {
    isMounted.current = false;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  };

  useEffect(() => { return cleanup; }, []);

  useEffect(() => {
    setFailedAttempts(0);
    setFeedback(null);
    setIsChecking(false);
    setReadingIndex(null);
    const sh = [...current.panels].sort(() => Math.random() - 0.5);
    setAvailable(sh);
    setPlaced([]);

    speakSentence(`Tell the story of ${current.title}!`, -1);
  }, [storyIndex, current]);

  const speakSentence = (text: string, panelOrderIndicator: number, rate = 0.8) => {
    return new Promise<void>((resolve) => {
      if (!window.speechSynthesis || !isMounted.current) {
        resolve();
        return;
      }
      window.speechSynthesis.cancel();
      setReadingIndex(panelOrderIndicator);

      const utt = new SpeechSynthesisUtterance(text);
      utt.rate = rate;
      utt.pitch = 1.2;

      const fallbackTimer = setTimeout(() => resolve(), text.length * 80 + 1000);

      utt.onend = () => {
        clearTimeout(fallbackTimer);
        resolve();
      };
      utt.onerror = () => {
        clearTimeout(fallbackTimer);
        resolve();
      };

      window.speechSynthesis.speak(utt);
    });
  };

  // TAP TO PLACE MECHANIC
  const addPanel = (panel: Panel) => {
    if (isChecking) return;
    soundManager.playPop();
    setPlaced(prev => [...prev, panel]);
    setAvailable(prev => prev.filter(p => p.order !== panel.order));
  };

  // TAP TO REMOVE MECHANIC
  const removePanel = (panel: Panel) => {
    if (isChecking) return;
    if (failedAttempts > 0 && panel.order === 1) return; // Prevent removing the smart hint!
    soundManager.playPop();
    setAvailable(prev => [...prev, panel]);
    setPlaced(prev => prev.filter(p => p.order !== panel.order));
  };

  const checkOrder = async () => {
    if (isChecking || placed.length !== current.panels.length) return;
    setIsChecking(true);

    const isCorrect = placed.every((p, i) => p.order === i + 1);

    if (isCorrect) {
      setFeedback('correct');
      soundManager.playSuccess();

      await speakSentence("Perfect! Let's read your story.", -1);

      // KARAOKE PLAYBACK
      for (let i = 0; i < placed.length; i++) {
        if (!isMounted.current) return;
        await speakSentence(placed[i].text, placed[i].order);
      }

      if (!isMounted.current) return;
      setReadingIndex(null);

      const newScore = score + 1;
      setScore(newScore);

      if (newScore >= 3) {
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
        setIsFinished(true);
        onComplete(10);
      } else {
        setTimeout(() => {
          if (isMounted.current) setStoryIndex(i => (i + 1) % gameSequence.length);
        }, 1500);
      }
      setIsChecking(false);

    } else {
      setFeedback('wrong');
      soundManager.playGameOver();
      setFailedAttempts(f => f + 1);

      await speakSentence("Hmm, let's hear how that sounds...", -1);

      // FUNNY INCORRECT PLAYBACK
      for (let i = 0; i < placed.length; i++) {
        if (!isMounted.current) return;
        await speakSentence(placed[i].text, placed[i].order);
      }

      if (!isMounted.current) return;
      await speakSentence("That sounds a little silly! Let's try again.", -1, 0.85);

      if (!isMounted.current) return;
      setReadingIndex(null);
      setFeedback(null);
      setIsChecking(false);

      // SMART HINT: Anchor Panel 1 to placed, put the rest back in available
      const p1 = current.panels.find(p => p.order === 1)!;
      const rest = current.panels.filter(p => p.order !== 1).sort(() => Math.random() - 0.5);
      setPlaced([p1]);
      setAvailable(rest);
    }
  };

  const reset = () => {
    cleanup(); // STOPS ANY AUDIO IMMEDIATELY!
    isMounted.current = true;
    setIsChecking(false); // IMMEDIATELY UNLOCKS GAME STATE!

    const newSeq = shuffleArray(STORIES);
    setGameSequence(newSeq);
    setStoryIndex(0);
    setScore(0);
    setIsFinished(false);
    setFailedAttempts(0);
  };

  return (
    <div className="space-y-8 text-center max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <Link to="/" onClick={cleanup} className="p-3 bg-white rounded-2xl shadow-md hover:bg-gray-50">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h2 className="text-3xl font-black text-pink-500">Story Time</h2>
        <div className="flex items-center gap-1 bg-white px-3 py-2 rounded-2xl shadow-sm">
          <Star className="fill-yellow-400 text-yellow-400 w-5 h-5" />
          <span className="text-pink-600 font-black">{score}/3</span>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={`w-5 h-5 rounded-full transition-all ${i < score ? 'bg-pink-500 scale-125' : 'bg-gray-200'}`} />
        ))}
      </div>

      {isFinished ? (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-white p-12 rounded-[40px] shadow-2xl border-8 border-pink-300 space-y-6">
          <div className="text-8xl">📖</div>
          <h3 className="text-4xl font-black text-[#2F3061]">Super Storyteller!</h3>
          <button onClick={reset} className="bg-pink-500 text-white px-10 py-5 rounded-3xl font-black text-2xl shadow-xl hover:scale-105 transition-transform">
            More Stories!
          </button>
        </motion.div>
      ) : (
        <div className="bg-white p-6 rounded-[40px] shadow-2xl border-8 border-pink-200 space-y-6">
          <div className="bg-pink-50 border-4 border-pink-100 rounded-3xl p-4">
            <h3 className="font-black text-xl text-[#2F3061]">{current.title}</h3>
            <p className="text-pink-500 text-sm font-bold mt-1">Tap the scenes to put them in order!</p>
          </div>

          <div>
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs mb-3">Your story order:</p>
            <div className={`min-h-[100px] flex gap-3 justify-center items-center p-3 rounded-3xl border-4 border-dashed flex-wrap transition-all ${feedback === 'correct' ? 'border-green-400 bg-green-50' :
              feedback === 'wrong' ? 'border-red-300 bg-red-50' :
                'border-pink-200 bg-gray-50'
              }`}>
              <AnimatePresence>
                {placed.map((panel, idx) => {
                  const isReadingThis = readingIndex === panel.order;
                  const isLockedHint = failedAttempts > 0 && panel.order === 1;

                  return (
                    <motion.button
                      key={panel.order}
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      whileTap={{ scale: 0.9 }} onClick={() => removePanel(panel)}
                      className={`rounded-2xl p-4 font-bold text-left shadow-md transition-all duration-300 min-w-[100px] max-w-[130px] ${isReadingThis ? 'bg-pink-300 scale-105 shadow-xl text-white' :
                        isLockedHint ? 'bg-green-50 border-4 border-green-300 text-gray-700 cursor-not-allowed opacity-90' :
                          'bg-pink-500 text-white hover:bg-pink-600'
                        }`}
                    >
                      {isLockedHint && <div className="text-green-600 mb-1"><Lock className="w-4 h-4" /></div>}
                      <div className="text-4xl mb-1">{panel.emoji}</div>
                      <div className={`text-xs leading-tight ${isLockedHint ? 'text-gray-700' : 'text-white'}`}>{panel.text}</div>
                      <div className={`text-xs mt-1 ${isLockedHint ? 'text-green-600' : 'text-pink-200'}`}>#{idx + 1}</div>
                    </motion.button>
                  );
                })}
                {placed.length === 0 && (
                  <p className="text-gray-300 font-bold">Tap scenes below to add them</p>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div>
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs mb-3">Story scenes:</p>
            <div className="flex gap-3 justify-center flex-wrap min-h-[120px]">
              <AnimatePresence>
                {available.map((panel) => (
                  <motion.button
                    key={panel.order}
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.95 }}
                    onClick={() => addPanel(panel)}
                    className="bg-orange-50 border-4 border-orange-200 rounded-2xl p-4 font-bold text-left hover:bg-orange-100 min-w-[100px] max-w-[130px]"
                  >
                    <div className="text-4xl mb-1">{panel.emoji}</div>
                    <div className="text-xs text-gray-600 leading-tight">{panel.text}</div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {placed.length === current.panels.length && !isChecking && (
            <motion.button
              initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={checkOrder}
              className="w-full bg-pink-500 text-white py-5 rounded-3xl font-black text-2xl shadow-xl hover:scale-105 transition-transform flex justify-center items-center gap-3"
            >
              Read My Story! <CheckCircle className="w-6 h-6" />
            </motion.button>
          )}
        </div>
      )}

      {/* The Restart button is no longer locked disabled if you click it mid-sentence! */}
      <button onClick={reset} className="flex items-center gap-2 mx-auto px-6 py-3 bg-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-200">
        <RotateCcw className="w-5 h-5" />
        Restart
      </button>
    </div>
  );
}