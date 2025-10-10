const logoAsciiArt: string = `%c                               \xA0
   ▄▄▄█▄▄                      \xA0
  ▀██▀▀████▄        %c▄██%c        \xA0
   ▀██▄▄ ▀███▄    %c▄█▀%c          \xA0
     ▀███▄▄ ▀█▄  %c▄█%c            \xA0
        ▀▀▀██   %c▀▀%c             \xA0
            ▄▄███▄▄            \xA0
         ▄███████████▄         \xA0
      ▄█████████████████▄      \xA0
   ▄███████████████████████▄   \xA0
 █████████████████████████████ \xA0
 %c██%c  %c█████████████████████████ \xA0
 %c██%c▀▀█▀   ▀█    ▀█    ▀█▀   %c██ \xA0
 %c██%c  █  ███████  ████  █  %c████ \xA0
 %c██%c  █▄   ▀█     █     █  %c████ \xA0
 %c██%c  ████  █ ██  █ ██  █  %c████ \xA0
 %c██%c  █▄   ▄█   ▄ █   ▄ █▄   %c██ \xA0
 █████████████████████████████ \xA0
   ▀███████████████████████▀   \xA0
      ▀█████████████████▀      \xA0
         ▀███████████▀         \xA0
            ▀▀███▀▀            \xA0
                               \xA0`;

const font = `font: 10pt "Courier New", monospace;`;
const styleBlack = font + 'color: black;';
const styleGreen = font + 'color: #3A8621;';
const styleGreenOnWhite = font + 'color: #3A8621; background: white;';

const colours = [
    styleGreen,
    Array(4).fill([styleBlack, styleGreen]).flat(),
    Array(6).fill([styleGreen, styleGreenOnWhite, styleGreen]).flat(),
].flat();

export function printAsciiArtLogoToConsolePhy() {
    console.log(logoAsciiArt, ...colours);
}
