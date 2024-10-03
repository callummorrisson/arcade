# Arcade

This is currently intended to be a games repository. I wanted a place where I could write games using structured JS code, and then serve them as static content. I also wanted these games to be indexed and searchable.

The indexing and searching seemed like it would probably be the most interesting part to work on, so I've started with that.

## Preview

Should currently be available on [github pages](https://callummorrisson.github.io/arcade).

## Dev

### Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Game Database Generation

The repo is structured such that games are defined independent of the main application. The idea being that a game is mostly self contained, and adding or removing a game shouldn't affect anything outside of it's folder.

In order to accomplish this while keeping to the static content idea, we need some kind of pre-build step that indexes all of the games, and collates them into a database that the application can reference. I have chosen to use a JSON file as the "database" for the time being, and I am using a custom webpack plugin to generate this file.

#### `GameDbGeneratorPlugin`

Currently the plugin runs the generation code every time webpack compiles, including every time the live server notices a file change. It also completely regenerates the database each time it runs. This will need to be revisited.