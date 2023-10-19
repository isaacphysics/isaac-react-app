// Thank you https://www.ascii-art-generator.org/
const logoAsciiArt: string =
  "\n" +
  " ............................\n" +
  "'dOOOOOOOd;,okOOOOOOOOOOOOOOo.     _ _|\n" +
  "'x0000000x' .;dO000000000000d.       |   __|  _` |  _` |  __|\n" +
  "'x0000000x'   .;dO0000000000d.       | \\__ \\ (   | (   | (\n" +
  "'x0000000x'     .;dO00000000d.     ___|____/\\__,_|\\__,_|\\___|\n" +
  "'x0000000x'       .,::::::::,.\n" +
  "'x0000000x'                          ___|                             |\n" +
  "'x0000000x'                         |      _ \\  __ `__ \\  __ \\  |   | __|  _ \\  __|\n" +
  "'x0000000x'                         |     (   | |   |   | |   | |   | |    __/ |\n" +
  "'x0000000k,                        \\____|\\___/ _|  _|  _| .__/ \\__,_|\\__|\\___|_|\n" +
  ".;xO00000Oxoooooooooooooooooc.                           _|\n" +
  "  .:xO0000000000000000000000d.       ___|      _)\n" +
  "    .:dO00000000000000000000d.     \\___ \\   __| |  _ \\ __ \\   __|  _ \\\n" +
  "      .;dO000000000000000000d.           | (    |  __/ |   | (     __/\n" +
  "        .;loooooooooooooooooc.     _____/ \\___|_|\\___|_|  _|\\___|\\___| \n" +
  "\n\xA0";

export function printAsciiArtLogoToConsoleCS() {
  if (navigator.vendor.indexOf("Google") > -1 || navigator.userAgent.indexOf("Firefox") > -1) {
    // eslint-disable-next-line no-console
    console.log(logoAsciiArt);
  }
}
