import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const extension: { config: ThemeConfig } = {
  config: {
    initialColorMode: "dark",
    useSystemColorMode: true,
  },
};

const theme = extendTheme(extension) as typeof extension;

export default theme;
