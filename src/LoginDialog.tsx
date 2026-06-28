import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { saveCredentials } from "./app/auth";

function LoginDialog({ onLogin }: { onLogin: () => void }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !pass) {
      setError(true);
      return;
    }
    saveCredentials(user, pass);
    onLogin();
  };

  return (
    <Dialog
      open
      onClose={() => {
        /* require login: do not dismiss */
      }}
      disableEscapeKeyDown
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>Flare Drive Login</DialogTitle>
      <form onSubmit={submit}>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Username"
            value={user}
            onChange={(e) => {
              setUser(e.target.value);
              setError(false);
            }}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Password"
            type="password"
            value={pass}
            onChange={(e) => {
              setPass(e.target.value);
              setError(false);
            }}
            error={error}
            helperText={
              error
                ? "Credentials rejected. If you just submitted, the username or password is wrong."
                : ""
            }
          />
        </DialogContent>
        <DialogActions>
          <Button type="submit" variant="contained" color="primary">
            Login
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default LoginDialog;
