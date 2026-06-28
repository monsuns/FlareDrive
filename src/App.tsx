import { ThemeProvider } from "@emotion/react";
import {
  createTheme,
  CssBaseline,
  GlobalStyles,
  Snackbar,
  Stack,
} from "@mui/material";
import React, { useEffect, useState } from "react";

import Header from "./Header";
import LoginDialog from "./LoginDialog";
import Main from "./Main";
import ProgressDialog from "./ProgressDialog";
import {
  AUTH_REQUIRED_EVENT,
  AuthRequiredError,
  clearCredentials,
  getCredentials,
} from "./app/auth";
import { TransferQueueProvider } from "./app/transferQueue";

const globalStyles = (
  <GlobalStyles styles={{ "html, body, #root": { height: "100%" } }} />
);

const theme = createTheme({
  palette: { primary: { main: "#f38020" } },
});

function App() {
  // Require login before any WebDAV call: the backend guards everything with
  // Basic auth and the browser won't surface a 401 prompt for fetch/XHR.
  const [authed, setAuthed] = useState(() => !!getCredentials());
  // Bump to remount Main (and re-fetch) after a successful login.
  const [authVersion, setAuthVersion] = useState(0);
  const [search, setSearch] = useState("");
  const [showProgressDialog, setShowProgressDialog] = React.useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handler = () => {
      clearCredentials();
      setAuthed(false);
    };
    window.addEventListener(AUTH_REQUIRED_EVENT, handler);
    return () => window.removeEventListener(AUTH_REQUIRED_EVENT, handler);
  }, []);

  const handleLogin = () => {
    setAuthed(true);
    setAuthVersion((v) => v + 1);
  };

  const handleError = (err: Error) => {
    // AuthRequiredError is already handled via the global event → login dialog.
    if (err instanceof AuthRequiredError) return;
    setError(err);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {globalStyles}
      {!authed ? (
        <LoginDialog onLogin={handleLogin} />
      ) : (
        <TransferQueueProvider>
          <Stack sx={{ height: "100%" }}>
            <Header
              search={search}
              onSearchChange={(newSearch: string) => setSearch(newSearch)}
              setShowProgressDialog={setShowProgressDialog}
            />
            <Main key={authVersion} search={search} onError={handleError} />
          </Stack>
          <Snackbar
            autoHideDuration={5000}
            open={Boolean(error)}
            message={error?.message}
            onClose={() => setError(null)}
          />
          <ProgressDialog
            open={showProgressDialog}
            onClose={() => setShowProgressDialog(false)}
          />
        </TransferQueueProvider>
      )}
    </ThemeProvider>
  );
}

export default App;
