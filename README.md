# QM Tokens

This package contains the sharable DTCG tokens to be used across Quartermaster applications. Through a token transformation pipeline with Style Dictionary, it provides theming and css properties for both web and react native.


## Style Dictionary Pipeline

1. Initialization: Defining a new `StyleDictionary` instance that defines which token values are to be 'source' tokens (emitted in final output), or 'include' (for reference only), registers any hooks, and sets up the various platforms to export the token values to.
2. Parser: Iterates through relevant token files based on a provided filepath and modify either the token file or tokens themselves. In this instance, it is used to create a sibling `letterSpacing` token to the semantic typography tokens to surface its value.
3. Transforms: Token values are modified by an array of transforms, defined by the `TransformGroup` and run sequentially. Transforms modify the token to be understood by a specific platform, and are therefore isolated per platform. Here we run built-in transforms, and several custom transforms to handle some custom configuration.
4. Formats: With the tokens transformed, the formats are responsible for rendering the template for the output file, whether it be CSS variables, a Tailwind @theme block, etc. 
5. Actions: After the output files have been generated, actions run to handle any custom side effects. In this case, an action is used to check for any invalid token values that could break the CSS, and will throw an error to break the build. 

## Project Structure

- `tokens/`: The source DTCG JSON files (primitives, semantics, modes).
- `src/`: Custom Style Dictionary logic (transforms, formats, actions).
- `dictionary-config.ts`: The creation of the StyleDictionary instances.
- `dist/`: The generated style artifacts.
