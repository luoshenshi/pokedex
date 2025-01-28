const axios = require("axios").default;

const cache = new Map();

async function fetchWithCache(url) {
  if (cache.has(url)) return cache.get(url);
  const response = await axios.get(url);
  cache.set(url, response.data);
  return response.data;
}

async function pokedex(pokemonName, callback) {
  const name = pokemonName.toLowerCase();

  try {
    const response = await axios.get(
      `https://pokeapi.co/api/v2/pokemon/${name}`
    );
    const data = response.data;

    const pokemon = {
      name: data.name,
      ID: data.id,
      types: data.types.map((e) => e.type.name),
      base_experience: data.base_experience,
      stats: data.stats,
      pokemonPic: data.sprites.other["official-artwork"].front_default,
      height: `${Math.floor((data.height * 3.937) / 12)}' ${Math.round(
        (data.height * 3.937) % 12
      )}"`,
      weight: `${((data.weight / 10) * 2.20462).toFixed(1)} lbs`,
      moves: data.moves.map((e) => e.move.name),
      shiny_sprite: data.sprites.front_shiny,
      held_items: data.held_items,
    };

    // Fetch abilities
    const abilityRequests = data.abilities.map((e) =>
      fetchWithCache(`https://pokeapi.co/api/v2/ability/${e.ability.name}`)
    );
    const abilityResponses = await Promise.all(abilityRequests);
    const abilities = abilityResponses.map((response) => {
      const englishEntries = response.effect_entries.filter(
        (entry) => entry.language.name === "en"
      );
      return {
        name: response.name,
        description: englishEntries.map((entry) => entry.effect).join(" "),
        shorter_description: englishEntries
          .map((entry) => entry.short_effect)
          .join(" "),
      };
    });
    pokemon.abilities = abilities;

    // Fetch species details
    const speciesResponse = await fetchWithCache(data.species.url);
    pokemon.isLegendary = speciesResponse.is_legendary;
    pokemon.base_happiness = speciesResponse.base_happiness;
    pokemon.habitat = speciesResponse.habitat
      ? speciesResponse.habitat.name
      : "Unknown";
    pokemon.shape = speciesResponse.shape.name;
    pokemon.category = speciesResponse.genera
      .find((e) => "en" === e.language.name)
      .genus.replace("Pokémon", "");
    pokemon.catch_rate = speciesResponse.capture_rate;
    pokemon.flavor_text_entries = speciesResponse.flavor_text_entries
      .filter((flavor_text_entry) => flavor_text_entry.language.name === "en")
      .map((flavor_text_entry) => ({
        flavor_text: flavor_text_entry.flavor_text,
        version: flavor_text_entry.version.name,
      }));
    pokemon.genders =
      speciesResponse.gender_rate === -1 ? "Unknown" : "Male, Female";
    pokemon.egg_groups = speciesResponse.egg_groups.map((e) => e.name);
    pokemon.color = speciesResponse.color.name;

    // Fetch evolution chain
    const evolutionResponse = await fetchWithCache(
      speciesResponse.evolution_chain.url
    );
    const evolutionChain = [];
    let current = evolutionResponse.chain;
    while (current) {
      const evolutionDetails = current.evolution_details[0] || {};
      evolutionChain.push({
        species_name: current.species.name,
        min_level: evolutionDetails.min_level || "N/A",
        trigger: evolutionDetails.trigger
          ? evolutionDetails.trigger.name
          : "Starter",
      });
      current = current.evolves_to[0] || null;
    }

    const evolutionPics = evolutionChain.map((evolution) => {
      const id = evolution.species_name.split("/").filter(Boolean).pop(); // Extract ID
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
    });
    pokemon.evolutionChain = evolutionChain;
    pokemon.evolutionPics = evolutionPics;

    // Fetch varieties
    const pokemonVariants = await Promise.all(
      speciesResponse.varieties.map(async (variety) => {
        const varietyData = await fetchWithCache(variety.pokemon.url);
        return {
          name: variety.pokemon.name,
          id: varietyData.id,
          sprite: varietyData.sprites.other["official-artwork"].front_default,
        };
      })
    );
    pokemon.varieties = pokemonVariants;

    // Fetch weaknesses
    const typeRequests = pokemon.types.map((type) =>
      fetchWithCache(`https://pokeapi.co/api/v2/type/${type}`)
    );
    const typeResponses = await Promise.all(typeRequests);
    const weaknesses = typeResponses.map(
      (response) => response.damage_relations
    );
    pokemon.weakness = weaknesses;

    callback(pokemon);
  } catch (error) {
    console.error(error);
    callback(null, error);
  }
}

module.exports = { pokedex };
