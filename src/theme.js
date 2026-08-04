import { createTheme, alpha } from "@mui/material/styles";

// Tema oscuro con acento índigo/violeta (el mismo #4F46E5/#4338CA del favicon de
// NotiYa), estructura de overrides calcada de minimal-ui-kit/material-kit-react
// (theme/core/*, components.tsx) pero repintada para modo oscuro.

// Escala de "superficie": 50 = fondo más oscuro del canvas, 900 = texto casi blanco.
const GREY = {
  50: "#0B0E14",
  100: "#12161E",
  200: "#1A1F2A",
  300: "#242A37",
  400: "#333B4B",
  500: "#5C6577",
  600: "#8890A0",
  700: "#AEB4C0",
  800: "#E9EBEF",
  900: "#FFFFFF",
};

const PRIMARY = { lighter: "#DCD6FE", light: "#9C8CFB", main: "#6D5DFB", dark: "#4F46E5", darker: "#3730A3" };
const SECONDARY = { lighter: "#FBD5EA", light: "#F783C7", main: "#EC4899", dark: "#BE185D", darker: "#831843" };
const INFO = { lighter: "#BEF3FF", light: "#67E8F9", main: "#22D3EE", dark: "#0E7490", darker: "#164E63" };
const SUCCESS = { lighter: "#D3FCD2", light: "#77ED8B", main: "#22C55E", dark: "#118D57", darker: "#065E49" };
const WARNING = { lighter: "#FFF5CC", light: "#FFD666", main: "#FFAB00", dark: "#B76E00", darker: "#7A4100" };
const ERROR = { lighter: "#FFE9D5", light: "#FFAC82", main: "#FF5630", dark: "#B71D18", darker: "#7A0916" };

const DIVIDER = alpha("#FFFFFF", 0.08);
const BORDER = alpha("#FFFFFF", 0.12);

const cardShadow = `0 0 0 1px ${alpha("#FFFFFF", 0.06)}, 0 8px 24px -6px ${alpha("#000000", 0.6)}`;
const dialogShadow = `0 24px 48px -8px ${alpha("#000000", 0.8)}`;
const dropdownShadow = `0 0 0 1px ${alpha("#FFFFFF", 0.06)}, -20px 20px 40px -4px ${alpha("#000000", 0.6)}`;

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { ...PRIMARY, contrastText: "#FFFFFF" },
    secondary: { ...SECONDARY, contrastText: "#FFFFFF" },
    info: { ...INFO, contrastText: GREY[100] },
    success: { ...SUCCESS, contrastText: "#FFFFFF" },
    warning: { ...WARNING, contrastText: GREY[100] },
    error: { ...ERROR, contrastText: "#FFFFFF" },
    grey: GREY,
    divider: DIVIDER,
    text: { primary: GREY[800], secondary: GREY[600], disabled: GREY[500] },
    background: { default: GREY[50], paper: GREY[100], neutral: GREY[200] },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: '"DM Sans Variable", "DM Sans", "Inter", sans-serif',
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: { fontFamily: '"Barlow", sans-serif', fontWeight: 800 },
    h2: { fontFamily: '"Barlow", sans-serif', fontWeight: 800 },
    h3: { fontFamily: '"Barlow", sans-serif', fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { fontWeight: 700, textTransform: "none" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: { body: { backgroundColor: GREY[50] } },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: { backgroundColor: alpha("#000000", 0.72) },
        invisible: { background: "transparent" },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 8 },
        containedInherit: {
          color: "#FFFFFF",
          backgroundColor: GREY[400],
          "&:hover": { backgroundColor: GREY[300] },
        },
        sizeLarge: { minHeight: 48 },
      },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined" },
    },
    MuiCard: {
      styleOverrides: {
        root: { position: "relative", boxShadow: cardShadow, borderRadius: 16, backgroundImage: "none" },
      },
    },
    MuiCardHeader: {
      defaultProps: {
        titleTypographyProps: { variant: "h6" },
        subheaderTypographyProps: { variant: "body2" },
      },
      styleOverrides: {
        root: { padding: "24px 24px 0" },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: { borderColor: BORDER },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: "none" },
        outlined: { borderColor: BORDER },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 16, boxShadow: dialogShadow },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 600 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontSize: 14,
          color: GREY[600],
          fontWeight: 600,
          backgroundColor: GREY[200],
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: { root: { fontSize: 14 } },
    },
    MuiLink: {
      defaultProps: { underline: "hover" },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          "&.Mui-selected": {
            backgroundColor: alpha(PRIMARY.main, 0.16),
            color: PRIMARY.light,
            "& .MuiListItemIcon-root": { color: PRIMARY.light },
            "&:hover": { backgroundColor: alpha(PRIMARY.main, 0.24) },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: "none", borderBottom: `1px solid ${DIVIDER}` },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { borderRight: `1px solid ${DIVIDER}` },
      },
    },
  },
});

theme.customShadows = { card: cardShadow, dialog: dialogShadow, dropdown: dropdownShadow };

export default theme;
