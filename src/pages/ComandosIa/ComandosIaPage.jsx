import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Stack,
  Typography,
  TextField,
  Button,
  IconButton,
  Card,
  Box,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import { motion, useReducedMotion } from "framer-motion";
import * as comandosIaApi from "../../api/comandosIa.api";
import PageHeader from "../../components/layout/PageHeader";
import EmptyState from "../../components/layout/EmptyState";
import { useStaggerReveal } from "../../hooks/useRevealAnimation";
import IconMagic from "~icons/solar/magic-stick-3-linear";

export default function ComandosIaPage() {
  const { negocioId } = useParams();
  const id = Number(negocioId);

  const [comandos, setComandos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");
  const listRef = useStaggerReveal({ translateY: 10, duration: 350, staggerDelay: 50 });

  const prefersReducedMotion = useReducedMotion();
  const [escuchando, setEscuchando] = useState(false);
  const [errorVoz, setErrorVoz] = useState("");
  const recognitionRef = useRef(null);
  const soportaVoz =
    typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const iniciarEscucha = () => {
    setErrorVoz("");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "es-CO";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      setTexto(event.results[0][0].transcript);
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted") return;
      setErrorVoz(
        event.error === "not-allowed" || event.error === "permission-denied"
          ? "Permiso de micrófono denegado"
          : "No se pudo reconocer el audio, intenta de nuevo"
      );
    };

    recognition.onend = () => {
      setEscuchando(false);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setEscuchando(true);
    } catch {
      setErrorVoz("No se pudo iniciar el micrófono, intenta de nuevo");
    }
  };

  const handleMicClick = () => {
    if (escuchando) {
      recognitionRef.current?.abort();
    } else {
      iniciarEscucha();
    }
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const cargar = useCallback(async () => {
    setComandos(await comandosIaApi.listar(id));
    setLoading(false);
  }, [id]);

  useEffect(() => {
    setLoading(true);
    cargar();
  }, [cargar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!texto.trim()) return;
    setError("");
    setErrorVoz("");
    setEnviando(true);
    try {
      const res = await comandosIaApi.crear(id, { textoOriginal: texto.trim() });
      setResultado(res);
      setTexto("");
      cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo interpretar el comando");
    } finally {
      setEnviando(false);
    }
  };

  const confirmar = async (comando) => {
    await comandosIaApi.confirmar(id, comando.id);
    setResultado(null);
    cargar();
  };

  const descartar = async (comando) => {
    await comandosIaApi.descartar(id, comando.id);
    setResultado(null);
    cargar();
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <PageHeader
        title="Comandos con IA"
        subtitle='Escribe en lenguaje natural, por ejemplo "avisa que se acabó el pan integral" o "promo de alitas mañana a las 5pm".'
      />

      <Card sx={{ p: 2.5, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              fullWidth
              placeholder="Escribe tu comando..."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
            {soportaVoz && (
              <IconButton
                onClick={handleMicClick}
                color={escuchando ? "error" : "default"}
                aria-label={escuchando ? "Detener grabación" : "Hablar comando"}
                sx={{
                  flexShrink: 0,
                  border: "1px solid",
                  borderColor: "divider",
                  alignSelf: { xs: "flex-start", sm: "auto" },
                }}
              >
                <Box
                  component={motion.div}
                  animate={escuchando && !prefersReducedMotion ? { opacity: [1, 0.4, 1] } : { opacity: 1 }}
                  transition={escuchando && !prefersReducedMotion ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } : {}}
                  sx={{ display: "flex" }}
                >
                  <MicRoundedIcon />
                </Box>
              </IconButton>
            )}
            <Button
              type="submit"
              variant="contained"
              disabled={enviando}
              endIcon={enviando ? undefined : <SendRoundedIcon />}
              sx={{ px: 3, flexShrink: 0 }}
            >
              {enviando ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Interpretar"}
            </Button>
          </Stack>
          {escuchando && (
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 1 }}>
              Escuchando…
            </Typography>
          )}
        </form>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {errorVoz && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorVoz}
          </Alert>
        )}

        {resultado && (
          <Box sx={{ mt: 2 }}>
            <Alert severity={resultado.borrador ? "info" : "warning"}>{resultado.mensaje}</Alert>
            {resultado.borrador && (
              <Card variant="outlined" sx={{ mt: 1.5, p: 2, boxShadow: "none" }}>
                <Typography sx={{ mb: 1.5 }}>{resultado.borrador.contenido}</Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<CheckRoundedIcon />}
                    onClick={() => confirmar(resultado.comando)}
                  >
                    Confirmar y publicar
                  </Button>
                  <Button size="small" startIcon={<CloseRoundedIcon />} onClick={() => descartar(resultado.comando)}>
                    Descartar
                  </Button>
                </Stack>
              </Card>
            )}
          </Box>
        )}
      </Card>

      <Typography variant="h6" sx={{ fontSize: "1.1rem", mb: 1.5 }}>
        Historial
      </Typography>
      {comandos.length === 0 ? (
        <EmptyState icon={IconMagic} title="Aún no has enviado comandos" description="Prueba escribiendo uno arriba." />
      ) : (
        <Stack ref={listRef} spacing={1.5}>
          {comandos.map((comando) => (
            <Card key={comando.id} sx={{ p: 2, opacity: 0 }}>
              <Typography sx={{ fontWeight: 600 }}>{comando.textoOriginal}</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 0.75, flexWrap: "wrap", rowGap: 0.5 }}>
                {comando.accionDetectada && <Chip size="small" label={comando.accionDetectada} />}
                <Chip
                  size="small"
                  label={comando.estado === "pendiente" && !comando.mensajeId ? "sin acción" : comando.estado}
                  color={comando.estado === "confirmado" ? "success" : comando.estado === "descartado" ? "default" : "warning"}
                />
                <Typography variant="caption" color="text.secondary">
                  confianza {Math.round((comando.confianza || 0) * 100)}%
                </Typography>
              </Stack>
              {comando.estado === "pendiente" && comando.mensajeId && (
                <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                  <Button size="small" variant="outlined" color="success" onClick={() => confirmar(comando)}>
                    Confirmar
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => descartar(comando)}>
                    Descartar
                  </Button>
                </Stack>
              )}
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}
