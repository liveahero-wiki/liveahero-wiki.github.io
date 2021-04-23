---
title: Marfik
characterId: 14
occupation: "University Professor (Archeology)"
h2:
  title: "\"The Adventurer\" Marfik"
---
{% capture BIO_H01 %}
Marfik transforms into a hero by dressing up with an adventurer-like appearance while handling two types of parallel weapons, a pickaxe and a rope. When he hits the ground with his pickaxe, he has the ability to evoke the "memory of the stars" that sleep deep within the stratum of the earth, and the rope can pull out the energy that embodies that memory and use it for attacks. However, he can only keep this power for a short time, usually just a few minutes.
{% endcapture %}

{% capture BIO_H02 %}
The supreme theory of life in Marfik's mind, who has an immense curiosity for such things, is "to know the mystery of space life". He wishes to leave himself to the spirit of inquiry, to go where he wants to go, to do what he wants to do, and to know what he wants to know. Because of that, he always ends up breaking up with the partners he loves. If such an existence that occupies his unyielding obsession appears, it will be an existence full of mystery.
{% endcapture %}

{% include hero-infobox.html stockId=10141 BIO_H01=BIO_H01 BIO_H02=BIO_H02 %}

{% include hero-infobox.html stockId=10142 %}

{% capture BIO_S01 %}
Archeologist enrolled in university, and an adventure-lover for as long as he remembers. An Earthling from Indianapolis, USA. Having vitality and toughness far from any ordinary person, he's a mischievous man in the prime of his life, who possesses both the composure and thinking power of a scholar, and the curiosity of a child.

He is interested in ancient civilizations from all sorts of planets, even the ones at the ends of the universe. It is said that if there is a place with rare ruins to explore, he will be there. On the other hand, he holds no interest whatsoever in the monetary value of the goods he digs out.
{% endcapture %}
{% include sidekick-infobox.html stockId=10141 BIO_S01=BIO_S01 %}

{% include voice-table.html resourceName="marfik"
h_gachaResult = "I'm Professor Marfik, the mythical adventure lover<br>Come with me on this far journey through history!"
s_gachaResult = "I’m Professor Marfik, a researcher passionate for the ancient times.<br>If you give me a hand with excavation here, I’ll return the favor with your work. How’s that sound?"
salesStart = "An excavation opportunity, let's go."
salesEnd = "Oo, we got a lot of results."
battleStart = "Let's get to work on the excavation. You don't want to get caught in the middle of it."
action = "It's my turn."
attack = "Like this!"
skill = "Dig it up."
special = "This is the wisdom of the ancient times. Search, Ruins Salvage!"
smallDamage = "Oo.."
bigDamage = "Guhuo.."
win = "Ha-ha, that's a complete victory. Well, if you want to challenge me to a fight...Come back in 10, or 100 years, no, make it 1000 years"
lose = "The adventure...is over...You really can't beat the waves of old age..."
assist = "We're not done yet."
assisted = "Thank you."
APPRECIATION = "Work is something you do at a pace you can do.<br>Once in a while is fine but,<br>Don't push yourself too much while you're still young, okay?"
PLAYER = "Looking at you reminds me of my youth.<br>I was desperately hitting anything.<br>Such good times... Eh, I haven't changed much even now? Really!?"
TOUCH = "Haha! How is it?<br>This old man's got a good body doesn't he?<br>These muscles are proof of being a true adventurer!"
TRAINED = "Why you...! Be more attentive to the elderly!"
TRAIN = "You think I'm just an old man?! Don't underestimate me!"
DAILY = "Yo, young captain.<br>How do you feel about going on an adventure with this old man?<br>W-Wha-? Your job comes first?... I-...I know..."
HERO =  "A child of a non-human, born of a mechanical star.<br>What kind of history and technology gave birth to that child?<br>It's pretty interesting..."
RELATION = "That doggy at your place is wonderful!<br>That kind of power would be invaluable in an excavation site.<br>How is it? Mind if I borrow them?"
%}

{% include voice-table.html resourceName="marfikRuins2104"
%}

## Notes:

- He refers to {% chara_link Andrew %} in his Hero line
