import DeckBuilder from './DeckBuilder.js';

const deckbuilder = new DeckBuilder();

// 1. (Optional) metadata
deckbuilder.addDetails({
  name:        'simple_deck',
  description: 'A two-slide demo',
  tags:        ['example'],
  status:      'draft'
});

// 2. Title slide: duration 5s, title shows at 0s
deckbuilder.s.titleSlide(5, [
  { name: 'title',   content: 'Hello, Taleem!', showAt: 0 }
]);

// 3. Bullet list: runs from 5s→15s, bullets at 6s and 8s
deckbuilder.s.bulletList(15, [
  { name: 'bullet', content: 'First point',   showAt: 6 },
  { name: 'bullet', content: 'Second point',  showAt: 8 }
]);

// 4. Produce the final deck JSON
const deck = deckbuilder.build();
console.log(JSON.stringify(deck, null, 2));
