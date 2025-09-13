---
title: Lilac
characterId: 101
type: humanoid
gender: male
h2:
  title: '"Blessed Rain" Lilac'
heroes:
- stockId: 11011
  BIO_H01: |-
    Lilac's pruning shears-shaped parallel weapon can be manipulated without being
    touched by his will alone, and he attacks by sending them flying after
    opponents.

    The size and number of shears can be adjusted according to the ViewPower
    consumed, but it takes a considerable amount of physical and mental strength to
    manipulate several of them at the same time.

    However, the sharpness of the shears is outstanding, and as long as the object
    is perceived by Lilac as a branch or leaf, it can cut off both sides of any
    object, no matter how hard it is.
  BIO_H02: |-
    Lilac's older brother, Hashidoi was born sickly from birth, with particularly
    poor eyesight and a fondness for flowers and other fragrant things.

    Contrary to his brother, Lilac as a child was active and dynamic, but when
    Hashidoi became ill and was unable to play with him for days at a time, he would
    lash out in childish anger and say things he didn't mean.

    Although he felt deep remorse even as a child, Lilac permanently lost the
    opportunity to apologize for it one day, and came to be grounded in the idea
    that what one wants to say should be said right away rather than put off.
  passiveSkillIds:
  - '8101101'
  - '8101102'
- stockId: 11012
  extra_sprites: fg_lilacSummerNight2407_h01_skin2,fg_lilacSummerNight2407_h01_skin3,fg_lilacSummerNight2407_h01_skin4,fg_lilacSummerNight2407_h01_skin5,fg_lilacSummerNight2407_h01_skin6,fg_lilacSummerNight2407_h01_skin7,fg_lilacSummerNight2407_h02_skin2
sidekicks:
- stockId: 11011
  BIO_S01: |-
    A young man born and raised in Wemalt, a peaceful city in a temperate alien
    region.

    Outwardly, he seems to be no different from the earthling, but he is an alien.

    His sharp glare tend to frighten others, which he is self concious about, so he
    hides his face beneath his hair often He has a soft and gentle personality.

    Influenced by his brother Hashidoi in his childhood, he became interested in
    plants and flowers.

    He believes that flowers, which are often used as gifts to convey feelings, have
    the power to convey some sentiments better than words.
  extra_sprites: fg_lilac_s01_skin1,fg_lilac_s01_skin2,fg_lilac_s01_skin3
---

{% include voice-table.html resourceName="lilac"
h_gachaResult = "My name is Lilac.<br>I work in a flower shop.<br>This smell......<br>You're in the business of exterminating kaibutsu.<br>Leave it to me, I'll cut 'em down with these shears."
s_gachaResult = "My name is Lilac. A florist.<br>I'm in charge of sidekicking this time, right?<br>Of course I can do it. I just finished a bouquet.<br>What do you think, beautiful, right?"
salesStart = "I understand, I'll go."
salesEnd = "I'm glad I could help."
battleStart = "I can handle any enemy, I'll show you just how sharp these shears are."
action = "I can go"
attack = "Now"
skill = "This is the power of plants!"
special = "Cut out the roots of the spreading evil!<br>Standing Flowers<br>Niemals Vergessen!"
smallDamage = "Guh"
bigDamage = "Gwah!"
win = "Thank you for your hard work. Your assistance with the operation was greatly appreciated.<br>It's important to take breaks and not push yourself too hard.<br>Let's relax a little with the scent of flowers."
lose = "I can't... Muster the strength anymore... Brother... Is this the end for me..."
assist = "I'll help you."
assisted = "That was a big help."
rankMax = "It's all thanks to you that I've grown this strong.<br>I'm sure my brother would be happy too.<br>I'll become even stronger to protect the people I care about."
loveIndexMax = "Being with you fills my heart like the scent of flowers,<br>and I find myself wishing I could stay by your side forever.<br>Would you let me choose a flower that suits you?"
APPRECIATION = "Thank you for your hard work. But please don't overdo it.<br>I'll make you a cup of herbal tea with a calming aroma.<br>I'll make it in your favorite fragrance."
DAILY = "My brother taught me about herbs and flowers a long time ago.<br>Each one smells different, has its meaning in the language of flowers...<br>It makes me happy when I see people enjoying flowers, too."
HERO = "I smell gunpowder on Flamier-san.<br>That's because she's a hero who attacks with bombs, huh?<br>...She doesn't just carry gunpowder all the time, right?"
PLAYER = "Hmm?　This scent...oh, excuse me.<br>I smell flowers pretty often, so I've gotten into a habit...<br>But your smell is kind of calming."
RELATION = "I 've done some work with Goro-san over at Laborer's Site before.<br>He bought me a drink at my welcome party...<br>We've talked a lot since then."
TOUCH = "Oh, what's wrong?<br>You're surprised at my physique because I'm a florist?<br>I do a lot of heavy lifting, so I get a good workout."
TRAIN = "Sorry if I made it too strenuous."
TRAINED = "Wait a minute...!"
EVENTA = "Welcome to Wemalt, the city of flowers.<br>Please enjoy the blooming flowers and plants.<br>If you like, I can show you around the city."
EVENTB = "There is a strange smell in the city...<br>What's going on? Is it really true that it is the work of ghosts?"
%}

{% include voice-table.html resourceName="lilacSummerNight2407"
h_gachaResult = "Performing on a water stage... huh?<br>It's a job I'm not used to, but I'll do my best.<br>Please watch my performance on stage!"
s_gachaResult = "A sidekick's job, I see. It's a little different from back home,<br>but with the power of wilderness plants, I'll be there to support you to the best of my ability."
salesStart = "I'll make it a great stage."
salesEnd = "I'm back. Was I of any help?"
battleStart = "The rain teaches me. Feelings never fade, they'll sprout someday!"
action = "Leave it to me!"
attack = "There!"
skill = "This is the rain of blessings!"
special = "The seeds of desire will sprout and will one day bloom!<br>Standing Flowers<br>Wertvoll Erinnerung!"
smallDamage = "Kuh...!"
bigDamage = "I can still... stand!"
win = "Thank you for your hard work, you're a little wet. Sorry,<br>I'll use my towel to dry you off right away. Don't move, leave it to me."
lose = "I can't afford to fall...! The seeds of my resolve will wither away...!"
assisted = "Thanks for the assist!"
rankMax = "The bond we've built together...<br>Those memories have made me so much stronger.<br>I'd be happy if you continue to stay with me."
APPRECIATION = "The sun is a bit strong today... Oh, right.<br>If you don't mind, this is flower oil sunscreen.<br>I'll apply it now, so could you please make yourself comfortable?"
DAILY = "Even in a town in the wilderness, plants take root properly<br>and grow strong and resilient.<br>I love these moments when I feel that vitality."
RELATION = "Every time I see Mr. Rudin, he smells different,<br>so when I asked why, he dodged the question.<br>He said it's a no-no to probe a magician's secrets..."
HERO = "I really love Kalaski's photos. They're gentle and warm, and I feel like they exactly capture Kalaski's essence."
PLAYER = "…Would it be okay if I held your hand?<br>I'm nervous about this unfamiliar job, but...<br>If you're watching over me, I feel like I can do it."
TOUCH = "Your hands feel cool and so nice. I was practicing for the show<br>just now, so my body is hot...<br>Um, can we stay like this a little longer?"
TRAIN = "I'm going to give it my all. Take this!"
TRAINED = "It's... more intense than I thought...!"
EVENTA = "This town is really lively, isn't it?<br>It reminds me a little of the flower festivals back home.<br>...Huh, do I look like I'm having fun?"
EVENTB = "Since I became a hero, I've hardly had any chances<br>to appear on shows like this...<br>Um... would you mind helping me practice my smile?"
EVENTC = "Would you like to help promote the show with me?<br>Mr. Rudin asked me to, but I also want to help the hotel staff<br>in any way I can."
EVENTD = "Thanks for your hard work. This is a thank you gift.<br>...But for me, the best reward is the memory of working alongside you."
%}

## Notes

- His skills is in German language:
- Base form:
  - Unsterblich : Immortal/Eternal
  - Ferne Erinnerung : Memories of distant past (Ferne = distant past, Erinnerung = memories)
  - Niemals Vergessen : Never forget (Niemals = never, Vergessen = forget)
- Variant form:
  - Veränderung : Change
  - Erholung Von Schmerz : Recovery from pain (Erholung = recovery, Von = from, Schmerz = pain)
  - Wertvoll Erinnerung : Valuable memories (Wertvoll = Valuable Erinnerung = memories)
