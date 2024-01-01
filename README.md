# Pokédex API

This API provides comprehensive information about Pokémon, making it perfect for creating a Pokédex with or without a user interface.

## Installation

To install the Pokédex API, use npm:

```bash
npm install real-pokedex
```

## Usage

You can use the Pokédex API to retrieve information about a specific Pokémon. Here's an example in `nodejs`:

```javascript
const { pokedex } = require("real-pokedex");

pokedex("emolga", (res) => {
  console.log(res);
});
```

Alternatively, you can also use the Pokédex API to look up a Pokémon by its Pokédex number:

```javascript
const { pokedex } = require("real-pokedex");

pokedex("244", (res) => {
  console.log(res);
});
```

If you encounter any issues while using the Pokédex API, please visit the issues section of the repository.

## Are You Ready, Trainers?

This API is the perfect tool for any Pokémon trainer looking to build their own Pokédex. Get started with the Pokédex API today and catch 'em all!

![Ash](https://media.tenor.com/VFvb5qCQGcUAAAAM/pokemon-ash.gif)
![Flabébé](https://media.tenor.com/kqRFL07JgmAAAAAM/flab%C3%A9b%C3%A9-flabebe.gif)
