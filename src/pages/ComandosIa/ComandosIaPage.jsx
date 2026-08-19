import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Stack,
  Typography,
  TextField,
  Button,
  Card,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Avatar,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RemoveCircleOutlineRoundedIcon from "@mui/icons-material/RemoveCircleOutlineRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SellRoundedIcon from "@mui/icons-material/SellRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import { motion, useReducedMotion } from "framer-motion";
import * as comandosIaApi from "../../api/comandosIa.api";
import * as whatsappVinculoApi from "../../api/whatsappVinculo.api";
import PageHeader from "../../components/layout/PageHeader";
import EmptyState from "../../components/layout/EmptyState";
import IconMagic from "~icons/solar/magic-stick-3-linear";

const INFO_ACCION = {
  crear_aviso: { label: "Aviso", icon: CampaignRoundedIcon, color: "#3B82F6" },
  crear_promocion: { label: "Promoción", icon: LocalOfferRoundedIcon, color: "#EC4899" },
  habilitar_producto: { label: "Habilitar producto", icon: CheckCircleRoundedIcon, color: "#22C55E" },
  deshabilitar_producto: { label: "Deshabilitar producto", icon: RemoveCircleOutlineRoundedIcon, color: "#F59E0B" },
  eliminar_producto: { label: "Eliminar producto", icon: DeleteOutlineRoundedIcon, color: "#EF4444" },
  cambiar_precio: { label: "Cambiar precio", icon: SellRoundedIcon, color: "#F59E0B" },
  cambiar_imagen: { label: "Cambiar imagen", icon: ImageRoundedIcon, color: "#8E33FF" },
  sin_accion: { label: "No entendido", icon: HelpOutlineRoundedIcon, color: "#94A3B8" },
};

const EJEMPLOS = [
  "avisa que se acabó el pan integral",
  "promo de alitas mañana a las 5pm por 15000",
  "el café ahora vale 6000",
  "quita el pan integral del catálogo",
];

function EstadoTurno({ comando, onConfirmar, onDescartar, procesando }) {
  const info = INFO_ACCION[comando.accionTipo] || INFO_ACCION.sin_accion;
  const Icono = info.icon;
  const pendienteDeConfirmar = comando.estado === "pendiente" && comando.requiereConfirmacion;
  const yaResuelto = comando.estado === "confirmado" || comando.estado === "descartado";

  return (
    <Card
      variant="outlined"
      sx={{
        p: 2,
        boxShadow: "none",
        borderColor: pendienteDeConfirmar ? "warning.main" : "divider",
        borderWidth: pendienteDeConfirmar ? 1.5 : 1,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Avatar sx={{ bgcolor: `${info.color}22`, color: info.color, width: 34, height: 34 }}>
          <Icono fontSize="small" />
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap", rowGap: 0.5, mb: 0.5 }}>
            <Typography variant="subtitle2">{info.label}</Typography>
            {comando.estado === "confirmado" && (
              <Chip size="small" icon={<CheckRoundedIcon />} label="Hecho" color="success" variant="outlined" />
            )}
            {comando.estado === "descartado" && (
              <Chip size="small" icon={<CloseRoundedIcon />} label="Descartado" variant="outlined" />
            )}
            {pendienteDeConfirmar && (
              <Chip size="small" label="Esperando tu confirmación" color="warning" variant="outlined" />
            )}
            {comando.accionTipo === "sin_accion" && (
              <Chip size="small" label="No se entendió" variant="outlined" />
            )}
          </Stack>

          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {comando.respuestaIA || comando.borradorContenido || "Comando procesado."}
          </Typography>

          {pendienteDeConfirmar && !yaResuelto && (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1.5 }}>
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<CheckRoundedIcon />}
                disabled={procesando}
                onClick={() => onConfirmar(comando)}
              >
                Sí, hacerlo
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<CloseRoundedIcon />}
                disabled={procesando}
                onClick={() => onDescartar(comando)}
              >
                No, descartar
              </Button>
            </Stack>
          )}
        </Box>
      </Stack>
    </Card>
  );
}

// Micrófono con auto-envío: clic para hablar, se detiene y envía solo
// cuando detecta que dejaste de hablar (silencio de ~1.5s).
function BotonMicrofono({ onTranscripcionFinal, disabled }) {
  const prefersReducedMotion = useReducedMotion();
  const [escuchando, setEscuchando] = useState(false);
  const [previa, setPrevia] = useState("");
  const [errorVoz, setErrorVoz] = useState("");
 const recognitionRef = useRef(null);
  const timeoutSilencioRef = useRef(null);
  const timeoutSinHablarRef = useRef(null);
  const textoAcumuladoRef = useRef("");

  const soportaVoz =
    typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const finalizarYEnviar = () => {
    recognitionRef.current?.stop();
    const textoFinal = textoAcumuladoRef.current.trim();
    setPrevia("");
    setEscuchando(false);
    if (textoFinal) onTranscripcionFinal(textoFinal);
  };

  const programarSilencio = () => {
    clearTimeout(timeoutSilencioRef.current);
    timeoutSilencioRef.current = setTimeout(finalizarYEnviar, 2800);
  };

  const iniciar = () => {
    setErrorVoz("");
    setPrevia("");
    textoAcumuladoRef.current = "";
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "es-CO";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let textoFinal = "";
      let textoParcial = "";
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) textoFinal += transcript;
        else textoParcial += transcript;
      }
      textoAcumuladoRef.current = textoFinal;
      setPrevia((textoFinal + " " + textoParcial).trim());
      clearTimeout(timeoutSinHablarRef.current);
      programarSilencio();
    };

    recognition.onerror = (event) => {
      clearTimeout(timeoutSilencioRef.current);
      if (event.error === "aborted") return;
      setErrorVoz(
        event.error === "not-allowed" || event.error === "permission-denied"
          ? "Permiso de micrófono denegado"
          : "No se pudo reconocer el audio, intenta de nuevo"
      );
      setEscuchando(false);
      setPrevia("");
    };

    recognition.onend = () => {
      setEscuchando((actual) => (actual ? false : actual));
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setEscuchando(true);
      // Si no dice NADA en absoluto (ni una palabra), cancelamos a los 6s.
      timeoutSinHablarRef.current = setTimeout(() => {
        if (!textoAcumuladoRef.current.trim()) {
          recognitionRef.current?.stop();
          setEscuchando(false);
          setPrevia("");
          setErrorVoz("No te escuché, intenta de nuevo");
        }
      }, 6000);
    } catch {
      setErrorVoz("No se pudo iniciar el micrófono, intenta de nuevo");
    }
  };

  const handleClick = () => {
    if (escuchando) {
      clearTimeout(timeoutSilencioRef.current);
      finalizarYEnviar();
    } else {
      iniciar();
    }
  };

    useEffect(() => {
    return () => {
      clearTimeout(timeoutSilencioRef.current);
      clearTimeout(timeoutSinHablarRef.current);
      recognitionRef.current?.abort();
    };
  }, []);

  if (!soportaVoz) return null;

  return (
    <Box sx={{ position: "relative" }}>
      {escuchando && (
        <Box
          sx={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            right: 0,
            left: { xs: 0, sm: "auto" },
            width: { xs: "100%", sm: "auto" },
            minWidth: { sm: 260 },
            maxWidth: { sm: 320 },
            minHeight: 40,
            bgcolor: "#111827",
            border: "1px solid",
            borderColor: "grey.700",
            px: 2,
            py: 1.25,
            borderRadius: 2,
            boxShadow: 6,
            zIndex: 10,
          }}
        >
          <Typography variant="body2" sx={{ color: "#fff !important" }}>
            {previa || "Escuchando…"}
          </Typography>
        </Box>
      )}

      <Box
        component={motion.button}
        type="button"
        onClick={handleClick}
        disabled={disabled}
        animate={escuchando && !prefersReducedMotion ? { scale: [1, 1.08, 1] } : { scale: 1 }}
        transition={escuchando ? { duration: 0.9, repeat: Infinity, ease: "easeInOut" } : {}}
        sx={{
          border: "none",
          cursor: disabled ? "default" : "pointer",
          width: { xs: "100%", sm: 44 },
          height: 44,
          borderRadius: { xs: 2, sm: "50%" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0.75,
          bgcolor: escuchando ? "error.main" : "action.hover",
          color: escuchando ? "#fff" : "text.primary",
          transition: "background-color 0.15s ease",
        }}
      >
        {escuchando ? (
          <Box
            component={motion.span}
            animate={!prefersReducedMotion ? { opacity: [1, 0.3, 1] } : {}}
            transition={{ duration: 0.9, repeat: Infinity }}
            sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#fff" }}
          />
        ) : (
          <MicRoundedIcon fontSize="small" />
        )}
        <Box component="span" sx={{ display: { xs: "inline", sm: "none" }, fontSize: "0.875rem" }}>
          {escuchando ? "Escuchando…" : "Hablar"}
        </Box>
      </Box>

      {errorVoz && (
        <Typography variant="caption" sx={{ color: "error.main", display: "block", mt: 0.5, textAlign: "right" }}>
          {errorVoz}
        </Typography>
      )}
    </Box>
  );
}

export default function ComandosIaPage() {
  const { negocioId } = useParams();
  const id = Number(negocioId);

  const [comandos, setComandos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [procesandoId, setProcesandoId] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [vinculando, setVinculando] = useState(false);
  const [codigoVinculo, setCodigoVinculo] = useState(null);

  const cargar = useCallback(async () => {
    setComandos(await comandosIaApi.listar(id));
    setLoading(false);
  }, [id]);

  useEffect(() => {
    setLoading(true);
    cargar();
  }, [cargar]);

  const enviarComando = useCallback(
    async (textoEnviado) => {
      if (!textoEnviado.trim()) return;
      setError("");
      setEnviando(true);
      try {
        const res = await comandosIaApi.crear(id, { textoOriginal: textoEnviado.trim() });
        if (!res.requiereConfirmacion) {
          setToast({ tipo: "success", texto: res.mensaje });
        }
        await cargar();
      } catch (err) {
        setError(err.response?.data?.mensaje || "No se pudo interpretar el comando");
      } finally {
        setEnviando(false);
      }
    },
    [id, cargar]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const textoEnviado = texto.trim();
    if (!textoEnviado) return;
    setTexto("");
    await enviarComando(textoEnviado);
  };

  const confirmar = async (comando) => {
    setProcesandoId(comando.id);
    try {
      const res = await comandosIaApi.confirmar(id, comando.id);
      setToast({ tipo: "success", texto: res.mensaje || "Listo, se aplicó el cambio" });
      await cargar();
    } catch (err) {
      setToast({ tipo: "error", texto: err.response?.data?.mensaje || "No se pudo confirmar" });
    } finally {
      setProcesandoId(null);
    }
  };

  const descartar = async (comando) => {
    setProcesandoId(comando.id);
    try {
      await comandosIaApi.descartar(id, comando.id);
      setToast({ tipo: "info", texto: "Comando descartado, no se hizo ningún cambio" });
      await cargar();
    } finally {
      setProcesandoId(null);
    }
  };

  const generarCodigoVinculo = async () => {
    setVinculando(true);
    try {
      const resultado = await whatsappVinculoApi.generarCodigo(id);
      setCodigoVinculo(resultado);
    } catch {
      setToast({ tipo: "error", texto: "No se pudo generar el código" });
    } finally {
      setVinculando(false);
    }
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
        subtitle="Habla o escribe lo que quieras hacer con tu catálogo, como si le hablaras a un empleado."
      />

      <Card sx={{ p: { xs: 2, sm: 2.5 }, mb: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }} justifyContent="space-between">
          <Box>
            <Typography variant="subtitle2">Usar comandos desde WhatsApp</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Vincula tu número para enviar estos mismos comandos por WhatsApp.
            </Typography>
          </Box>
          <Button variant="outlined" onClick={generarCodigoVinculo} disabled={vinculando} sx={{ flexShrink: 0 }}>
            {vinculando ? <CircularProgress size={20} /> : "Vincular WhatsApp"}
          </Button>
        </Stack>
        {codigoVinculo && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Envía el código <strong>{codigoVinculo.codigo}</strong> por WhatsApp al número del negocio para
            activarlo. Vence en 10 minutos.
          </Alert>
        )}
      </Card>

      <Card sx={{ p: { xs: 2, sm: 2.5 }, mb: 3, position: "sticky", top: 8, zIndex: 1, overflow: "visible" }}>
        <form onSubmit={handleSubmit}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              fullWidth
              placeholder="Escribe, o mantén presionado el micrófono para hablar"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
            <BotonMicrofono onTranscripcionFinal={enviarComando} disabled={enviando} />
            <Button
              type="submit"
              variant="contained"
              disabled={enviando}
              endIcon={enviando ? undefined : <SendRoundedIcon />}
              sx={{ px: 3, flexShrink: 0 }}
            >
              {enviando ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Enviar"}
            </Button>
          </Stack>
        </form>

        {!enviando && comandos.length === 0 && (
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1, mt: 2 }}>
            {EJEMPLOS.map((ej) => (
              <Chip key={ej} label={ej} size="small" variant="outlined" onClick={() => setTexto(ej)} sx={{ cursor: "pointer" }} />
            ))}
          </Stack>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}
      </Card>

      {comandos.length === 0 ? (
        <EmptyState icon={IconMagic} title="Aún no has enviado comandos" description="Escribe o habla arriba para empezar." />
      ) : (
        <Stack spacing={2}>
          {comandos.map((comando) => (
            <Box key={comando.id}>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5, ml: 0.5 }}>
                Tú dijiste:
              </Typography>
              <Typography sx={{ fontWeight: 600, mb: 1 }}>&ldquo;{comando.textoOriginal}&rdquo;</Typography>
              <EstadoTurno
                comando={comando}
                onConfirmar={confirmar}
                onDescartar={descartar}
                procesando={procesandoId === comando.id}
              />
            </Box>
          ))}
        </Stack>
      )}

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {toast && (
          <Alert severity={toast.tipo} variant="filled" onClose={() => setToast(null)} sx={{ width: "100%" }}>
            {toast.texto}
          </Alert>
        )}
      </Snackbar>
    </Container>
  );
}