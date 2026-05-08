# Nassim's Folly with Roberto — Content Seed v2

> Supersedes v1. Wendell Crouch has been replaced by **Gnatalee McCringleberry,
> Keeper of the Sanity.** All affected entries rewritten.
>
> Read, edit, then in a future Claude Code session: *"Seed `/content/diary`,
> `/content/fun_facts`, and `/content/activities` in the `wal-nassims-folly`
> RTDB from this file."*

---

## 1. The Keeper of the Sanity

**Full title:** Gnatalee McCringleberry, Keeper of the Sanity.

**Pronunciation:** *Natalie.* The G is silent.

**The title's origin:** self-bestowed. Within the first week at sea, Gnatalee — having come aboard as J.D.M.'s assistant chronicler — drafted a one-page charter of her own duties, signed it, and pinned it to the mainmast. The title at the top read **Keeper of the Sanity.** J.D.M. has not removed the charter. He has not endorsed it either. He no longer mentions it. The equilibrium is workable.

**Voice rules:**
- Clinical, precise, never raises her voice
- Never directly contradicts the Captain — uses footnoted addenda labelled **NOTES FOR ACCURACY** to do the work
- Prefers passive constructions and exact numbers
- Has done research the Captain has not done
- Lets a flicker of weariness through at the end of an entry, never the start
- Will eventually develop sympathy for J.D.M. — but not for several months
- Signs her addenda **Gnatalee McCringleberry, Keeper of the Sanity**

**Format pattern:** every J.D.M. diary entry can carry an optional Gnatalee appendix. Stored as one `/content/diary/{id}` document with `keeper_note` as an optional field. Renders as a single diary card; visually the Keeper's section is differentiated (Designer call — different type, slight indent, off-white instead of cream).

**Voice sample (standalone, for the team):**

> **NOTES FOR ACCURACY**
>
> *Re: the Captain's account of provisioning, dated yesterday.*
>
> The Captain's "abundance" of fresh water consists of seven barrels, of which three are vinegar. The vinegar barrels were inherited from the previous owner of the vessel and are believed to predate her. I have re-labelled them.
>
> The "fresh meat" referenced in paragraph two is salt pork. It is, by the cook's assessment, "salt pork in the technical sense." I take this to mean it once was.
>
> The crew's morale is, as the Captain notes, high. This is in part because the crew does not know about the vinegar.
>
> Respectfully,
> Gnatalee McCringleberry, Keeper of the Sanity

---

## 2. Diary Entries (Seed: 3)

### Entry 1 — Pre-departure

**Slug:** `dep-001`
**Author:** J'Dinklage Morgoone
**In-world date:** Year of Our Voyage, Day Negative-Three-Hundred-and-Sixty-One
**Title:** *I Have Purchased a Ship*

> *Dear Roberto,*
>
> *I have purchased a ship.*
>
> *It is not the ship I was sent to purchase. The ship I was sent to purchase had two masts and was, by the broker's account, "seaworthy in most weathers." This ship has one mast and is, by the new broker's account, "honest about its limitations."*
>
> *I have named her* Patience, *in the hope that she will demand it of me rather than possess it herself.*
>
> *The crew has been assembled. There is a cook, a navigator, and an assistant chronicler named Natalie, who has accepted the post with admirable composure and has already begun making lists.*
>
> *We sail at dawn, weather permitting, and on the following dawn, weather not permitting. The destination is Tenerife. The route is the route. I trust the stars.*
>
> *Faithfully,*
> *J.D.M.*

**Keeper's addendum (`keeper_note`):**

> Re: my name.
>
> It is **Gnatalee.** With a G. The G is silent. I have answered this question.
>
> Re: the vessel.
>
> The keel is of concern. The Captain's reassurance was not based on inspection. The vessel has one mast because the second was sold by the previous owner to settle a debt. The debt remains unsettled and is unrelated to the vessel.
>
> *Patience* is a serviceable name. I would have preferred *Prudence.*
>
> Respectfully,
> Gnatalee McCringleberry, Keeper of the Sanity

---

### Entry 2 — Mid-voyage (the canonical sample)

**Slug:** `voy-014`
**Author:** J'Dinklage Morgoone
**In-world date:** Day 14 at Sea
**Title:** *Shipwrecked, Pleasantly*

> *Dear Roberto,*
>
> *The stars were obscured today. We took a wrong turn somewhere east of the trade winds. Cook claims he saw the Canaries on the horizon at dawn but Cook also claims many things, including parentage by a duchess and a working knowledge of French.*
>
> *Fortune is shining upon us. We find ourselves shipwrecked. It appears to be a pleasant beach. We have an abundance of fruits — papaya, banana, a small green thing the men are arguing about. I have tasked the crew with beginning fortifications for your arrival.*
>
> *Nassim will, I trust, find the wine cellar acceptable. I have buried the better bottles for safekeeping.*
>
> *— J.D.M.*

**No Keeper's addendum on this one.** Saving Gnatalee's full deflationary appearance for Entry 3 — first-time readers should hear the Captain's voice clean once before the corrections compound.

---

### Entry 3 — Arrival

**Slug:** `arr-001`
**Author:** J'Dinklage Morgoone
**In-world date:** Day 41 — Arrival at Tenerife
**Title:** *We Have Arrived*

> *Dear Roberto,*
>
> *We have arrived. The locals call this place Tenerife, which I'm told means "white mountain" in the old tongue and refers to the volcano which dominates the centre of the island. The volcano is currently dormant, which is, for our purposes, ideal.*
>
> *I have secured what I believe will be your residence. It overlooks the sea. There are rooms enough for everyone, and a kitchen the cook has already declared "operationally adequate," which from him is unusually positive.*
>
> *The wine situation is favourable. I will say no more, in case this letter is intercepted.*
>
> *I begin scouting activities. There is, I am told, a sport here in which men strap themselves to large kites and are dragged across the water at high speed. I have not yet ascertained whether this is a sport or a punishment. Glenn will know.*
>
> *Until your arrival,*
> *J.D.M.*

**Keeper's addendum:**

> Re: the above.
>
> *Tenerife* does not, to the best of my research, mean "white mountain." It is from the Guanche language, and the consensus translation is closer to "snow mountain" or "mountain of fire," depending on the source. The Captain has not consulted any sources. He has consulted a man at the dock who appeared knowledgeable.
>
> The volcano is named Teide. It is not "currently dormant." It is *dormant.* The distinction is important to those of us standing at its base.
>
> The residence the Captain refers to as "secured" has been viewed, not rented. The viewing was conducted from a distance of approximately 200 metres, on foot, while the property's owner was not present. I have begun separate inquiries.
>
> The kitchen has not been entered.
>
> Glenn does indeed know about kiteboarding. The Captain has been told this multiple times.
>
> Respectfully,
> Gnatalee McCringleberry, Keeper of the Sanity

---

## 3. Fun Facts Pool (50)

> Each fact gets stored as `/content/fun_facts/{id}` with `text`, `category`, and optional `source` or `chronicler` fields. Categories suggested below; tune freely.
>
> **Verify before publishing.** Drawn from general knowledge — accurate to the best of my training data, but Tenerife restaurants close, hiking permits change, and Michelin stars come and go. A 30-minute verification pass before Phase 3 ships will catch the wobblers.

### Geography & Nature

1. Mount Teide is 3,718 metres tall — the highest point in Spain and the third-largest volcano in the world by volume from its base on the ocean floor. *Category: geography*
2. From the summit of Teide on a clear day, you can see all the other Canary Islands. *Category: geography*
3. Tenerife is roughly the size of London by area but has about one-eighth the population. *Category: geography*
4. The island has 43 microclimates. You can drive from sun into fog in ten minutes. *Category: geography*
5. The black-sand beaches in the north are black because the sand is volcanic. The yellow-sand beaches in the south were imported from the Sahara. *Category: geography*
6. Mount Teide last erupted in 1909. Its summit averages snow most winters. *Category: geography*
7. The waters around Tenerife host 28 species of whale and dolphin — one of the most diverse cetacean populations in Europe. *Category: nature*
8. The Anaga rural park in the northeast is a UNESCO Biosphere Reserve. Its laurel forest is a living relic of forests that covered Europe millions of years ago. *Category: nature*
9. There are no native land mammals on Tenerife. Every furry thing arrived by boat or by plane. *Category: nature*
10. Tenerife is roughly 12 million years old — younger than the dinosaurs by about 60 million. *Category: geography*
11. The dragon trees of Tenerife can live for centuries; the Drago Milenario in Icod de los Vinos is estimated at 800-plus years old, though the local legend claims a thousand. *Category: nature*

### Names & Etymology

12. The Canary Islands are named after dogs, not birds. From the Latin *canariae insulae* — "islands of dogs." *Category: etymology*
13. Canary birds are named after the islands, which are named after the dogs. *Category: etymology*
14. *Tenerife*, in the Guanche language, is generally translated as "snow mountain" or "mountain of fire." The Keeper has views on which is correct. The Captain has different views. *Category: etymology · chronicler*

### History & People

15. The Guanches were the indigenous people of Tenerife — tall, often fair-haired, likely descended from Berber peoples of North Africa. *Category: history*
16. The Guanches mummified their dead. Hundreds of mummies have been found in volcanic caves. *Category: history*
17. The Spanish conquest of Tenerife took until 1496 — it was the last Canary Island to fall. *Category: history*
18. The Guanches communicated across deep valleys using a whistled language. A modern descendant, *Silbo Gomero*, is still taught in schools on neighbouring La Gomera and is recognised by UNESCO. *Category: history*
19. Silbo can carry up to 5 km across a canyon. *Category: history*
20. Christopher Columbus stopped in the Canaries on every one of his voyages to the Americas. *Category: history*
21. Tenerife's flag is blue with a white saltire — the same as Scotland's. The reason is debated; the most romantic explanation involves 18th-century Scottish merchants. *Category: history*
22. La Laguna, the old capital, is a UNESCO World Heritage city and is said to be the historical model for the colonial grids of Havana, Lima, and San Juan. *Category: history*
23. Carnival in Santa Cruz de Tenerife is one of the largest in the world after Rio. *Category: culture*

### Food & Drink

24. *Papas arrugadas* — Canarian "wrinkled potatoes" — are boiled in seawater so concentrated the salt crystallises on the skin. *Category: food*
25. They are served with mojo: red mojo (paprika, garlic, oil) for meat; green mojo (cilantro, garlic, oil) for fish. *Category: food*
26. Tenerife produces wine. The vines on the slopes of Teide grow in volcanic ash and are some of the highest-elevation vineyards in Europe. *Category: drink*
27. *Malvasia* wine from the Canaries is the wine Shakespeare references as "Canary sack." Falstaff drinks it. *Category: drink*
28. The Canary Islands were the first place outside Asia where bananas were commercially grown for European markets, starting in the 15th century. *Category: food*
29. The local goat cheese, *queso de cabra*, comes in three forms: fresh, semi-cured, and smoked over wood. *Category: food*
30. There is a fish here called *vieja* — "old woman." It is delicious. The name's origin is contested; nobody can satisfactorily explain it. *Category: food*

### Architecture & Things to See

31. The Auditorio de Tenerife in Santa Cruz, designed by Santiago Calatrava, looks like a wave or a fin depending on your mood. *Category: architecture*
32. There is a working observatory near Teide because the air is so clear; the European Solar Telescope is being built there. *Category: science*
33. The town of Garachico was almost wiped off the map by the 1706 lava flow. The lava reshaped the coastline; the town rebuilt on top of the new ground. *Category: history*
34. The lava pools at El Caleton in Garachico are now natural swimming pools. You swim where the lava cooled. *Category: things-to-do*
35. The Pyramids of Güímar are six stepped stone structures of debated origin. Thor Heyerdahl championed an Atlantean theory. The current archaeological consensus is more prosaic. The Keeper agrees with the consensus. The Captain has not been consulted. *Category: history · chronicler*

### Practical

36. The currency is the euro. *Category: practical*
37. The Canary Islands run on Western European Time, UTC+0 — one hour behind mainland Spain. *Category: practical*
38. The Canaries have a special low-VAT regime called IGIC, generally lower than mainland Spanish VAT. Robert's wallet will notice. *Category: practical*
39. The sun on Tenerife is no joke — UV index regularly hits 9–11 even in winter. SPF 50, hat, the works. *Category: practical*
40. Most beaches have free public showers and changing facilities. *Category: practical*
41. The driving distance from one end of Tenerife to the other is about 80 km, but it can take three hours due to mountains. *Category: practical*
42. The public bus system, TITSA, is reliable, inexpensive, and goes most places worth going. The Keeper has tested seven routes. The Captain refuses to use it on principle. The principle has not been disclosed. *Category: practical · chronicler*

### Wind & Water (relevant to Robert + Glenn)

43. El Médano on the south coast is one of Europe's most consistent kiteboarding and windsurfing spots and hosts world-tour events. *Category: wind*
44. The wind at El Médano is reliable because Mount Teide creates a venturi effect that funnels Atlantic trade winds through specific bays on the south coast. *Category: wind*
45. The most important kite-related fact: bring booties; the entry to the water is rocky. *Category: wind*

### Chronicler Notes (mixed)

46. *J.D.M. notes:* "I am told there is a beach made of green sand. I have not yet found it. I suspect it of being a rumour propagated by men who own boats."
   *The Keeper appends:* The green-sand beach is on Hawaii. The Captain has been told this. He chooses to believe Tenerife has one too. *Category: chronicler*
47. *The Keeper reports:* "The Captain has, this week, declared three separate locations to be 'the spiritual centre of the island.' I have catalogued them. They are not adjacent." *Category: chronicler*
48. *J.D.M.:* "The locals here have a saying — *no hay mal que por bien no venga* — there is no bad from which good does not eventually come. I have adopted this as our voyage motto." *Category: culture*
49. *The Keeper:* "The Captain's voyage motto, adopted yesterday, has already been replaced. The new motto is *de noche todos los gatos son pardos* — at night all cats are grey. He has not yet explained the relevance." *Category: chronicler*
50. *J.D.M.:* "I am informed that Tenerife sits on the edge of where the medieval mapmakers wrote *here be dragons.* I find this entirely fitting and have asked the Keeper to keep watch."
   *The Keeper:* "I am the Keeper of the Sanity, not of the Dragons. The distinction is important to me." *Category: history · chronicler*

---

## 4. Activities Seed (20)

> Each gets stored as `/content/activities/{id}` with `title`, `description`, `category`, `image_url` (deferred), `external_link` (optional), `order`.
>
> **Verify before publishing.** Restaurants in particular need a fresh check before going live — these are starting points pulled from general knowledge, not a 2026 reservations list.

### Wind & Water — kite focus (Robert + Glenn)

1. **El Médano** — the headline kite spot. South coast. Reliable trade winds, world-tour caliber, beach café culture. *Category: wind*
2. **Cabezo (north of El Médano)** — for stronger conditions when El Médano is maxed out. Same town, walk over from the main beach. *Category: wind*
3. **Playa de las Teresitas** — calm, golden-sand (imported), good for swimming and rest days. *Category: water*

### Golf

4. **Golf Costa Adeje** — championship course on the south coast with Atlantic views. *Category: wheels*
5. **Golf del Sur** — older course, has hosted European Tour qualifying events. *Category: wheels*
6. **Buenavista Golf** — Severiano Ballesteros design, dramatic clifftop course on the northwest coast. *Category: wheels*

### Hiking

7. **Mount Teide summit** — cable car most of the way; permit-required final ascent on foot to the crater. Book the permit weeks ahead. *Category: feet*
8. **Anaga Mountains, Sendero de los Sentidos** — short, accessible laurel-forest trail. Cruz del Carmen for longer routes and the viewpoint. *Category: feet*
9. **Masca Gorge** — historically the iconic Tenerife hike: steep canyon descent to a beach with boat pickup. Access has been heavily regulated in recent years; *verify current permit status before recommending*. *Category: feet*
10. **Barranco del Infierno (Adeje)** — book-ahead permit hike, waterfall finish. *Category: feet*

### Sea & Kayaking

11. **Los Gigantes cliffs by sea kayak** — towering cliffs on the west coast; whale and dolphin sightings common from the water. *Category: water*
12. **La Caleta (Adeje) coves** — calm water, easy paddling, snorkel stops. *Category: water*

### Restaurants — starter list

> *Verification note: every one of these needs a fresh check before going on the live page. Restaurants in tourist regions change owners, lose stars, and close. Treat this as a curation seed, not a recommendation list.*

13. **La Tasquita de Min** *(Santa Cruz)* — modern Canarian, reservation essential. *Category: food*
14. **El Rincón de Juan Carlos** *(La Caleta)* — fine-dining tasting menu; verify current Michelin status and booking lead time. *Category: food*
15. **Bodegón Campestre** *(La Esperanza area)* — classic Canarian roadside grill, no reservations, queue with the locals. *Category: food*
16. **Tasca Silbo Gomero** *(La Laguna)* — traditional, named after the whistled language. *Category: food*

### Culture & Island Orientation

17. **La Laguna old town** — UNESCO; half-day wander, lunch in the old quarter. *Category: culture*
18. **Garachico** — the town the lava reshaped; lava pools at El Caleton, lunch in the square, easy half-day. *Category: culture*
19. **Pyramids of Güímar** — half-day; small museum, gardens, and the full Heyerdahl story. *Category: culture*
20. **Loro Parque** *(Puerto de la Cruz)* — large aquarium and zoo with controversial animal-welfare history (orca captivity in particular). Listed for completeness; decide as a couple. *Category: culture*

---

## 5. Verification Checklist (before Phase 3+4 ships)

- [ ] Spot-check 5 random fun facts against current sources; if any are wrong, audit the rest of that category
- [ ] Confirm Mount Teide permit booking process and current lead time
- [ ] Confirm Masca Gorge access status (this has been in flux)
- [ ] Re-verify each restaurant: open? same chef? Michelin status if claimed?
- [ ] Confirm Loro Parque is something you actually want to recommend given the welfare context
- [ ] Confirm IGIC rate is still what's claimed (changes occasionally with Spanish budget cycles)
- [ ] Sanity-check the Tenerife → mainland Spain timezone offset around DST transitions
- [ ] Designer-persona pass on the diary entries: do they read on a phone? Is the Keeper's addendum visually distinguishable from the Captain's voice?

---

## 6. What's Not Here Yet

- More diary entries — the three above anchor the voice; from here it's monthly cadence
- The Keeper's pinned-charter origin story (deferred to a mid-2026 entry)
- A second wave of fun facts as the trip nears (T-minus-30, T-minus-7 versions that get more specific)
- Property gallery copy — waiting on the property
- Anything about the actual day-to-day trip itinerary — explicitly out of scope per the spec
