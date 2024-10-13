const axios = require("axios").default;

async function pokedex(pokemonName, callback) {
  let name = pokemonName.toLowerCase();

  try {
    let response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`);
    let data = response.data;

    let pokemon = {
      name: data.name,
      ID: data.id,
      types: data.types.map((e) => e.type.name),
      abilities: data.abilities.map((e) => e.ability.name),
      stats: data.stats,
      pokemonPic: data.sprites.other["official-artwork"].front_default,
      height:
        Math.floor((10 * data.height) / 2.54 / 12) +
        "' " +
        Math.round(((10 * data.height) / 2.54) % 12) +
        '"',
      weight:
        (2.20462 * parseInt(data.weight.toString().slice(0, -1))).toFixed(1) +
        " lbs",
      moves: data.moves.map((e) => e.move.name),
    };

    let speciesResponse = await axios.get(data.species.url);
    pokemon.isLegendary = speciesResponse.data.is_legendary;
    pokemon.category = speciesResponse.data.genera
      .find((e) => "en" === e.language.name)
      .genus.replace("Pokémon", "");
    pokemon.genders =
      speciesResponse.data.gender_rate == -1 ? "Unknown" : "Male, Female";

    let evolutionResponse = await axios.get(
      speciesResponse.data.evolution_chain.url
    );
    let chain = evolutionResponse.data.chain;
    let evolutionChain = [];

    function getEvolution(a) {
      if (a) {
        evolutionChain.push({
          species_name: a.species.name,
          evolution_details: a.evolution_details,
        });
        for (let i = 0; i < a.evolves_to.length; i++)
          getEvolution(a.evolves_to[i]);
      }
    }

    getEvolution(chain);
    pokemon.evolutionChain = evolutionChain;

    let evolutionPics = await Promise.all(
      evolutionChain.map(async (e) => {
        let a = `https://pokeapi.co/api/v2/pokemon/${e.species_name}`;
        let t = await axios
          .get(a)
          .then((e) => e.data.sprites.other["official-artwork"].front_default);
        return t;
      })
    );

    pokemon.evolutionPics = evolutionPics;

    let weakness = await Promise.all(
      pokemon.types.map(async (e) => {
        let a = await axios.get(`https://pokeapi.co/api/v2/type/${e}`);
        return a.data.damage_relations.double_damage_from.map((e) => e.name);
      })
    );

    pokemon.weakness = weakness;

    callback(pokemon);
  } catch (error) {
    console.error(error.response.statusText);
  }
}

module.exports = { pokedex };
