import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Stack, Typography, Button, Card, Box, Chip, IconButton, CircularProgress } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import * as mensajesApi from "../../api/mensajes.api";
import * as plantillasApi from "../../api/plantillas.api";
import MensajeFormDialog from "./MensajeFormDialog";
import PageHeader from "../../components/layout/PageHeader";
import EmptyState from "../../components/layout/EmptyState";
import { useStaggerReveal } from "../../hooks/useRevealAnimation";
import IconChat from "~icons/solar/chat-round-dots-linear";

const ESTADOS = [
  { value: null, label: "Todos" },
  { value: "pendiente", label: "Pendientes" },
  { value: "enviado", label: "Enviados" },
  { value: "fallido", label: "Fallidos" },
  { value: "cancelado", label: "Cancelados" },
];

const COLOR_ESTADO = { pendiente: "warning", enviado: "success", fallido: "error", cancelado: "default" };

export default function MensajesPage() {
  const { negocioId } = useParams();
  const id = Number(negocioId);

  const [mensajes, setMensajes] = useState([]);
  const [plantillas, setPlantillas] = useState([]);
  const [estado, setEstado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const listRef = useStaggerReveal({ translateY: 10, duration: 350, staggerDelay: 50 });

  const cargar = useCallback(async () => {
    const [msgs, plns] = await Promise.all([mensajesApi.listar(id, estado || undefined), plantillasApi.listar(id)]);
    setMensajes(msgs);
    setPlantillas(plns);
    setLoading(false);
  }, [id, estado]);

  useEffect(() => {
    setLoading(true);
    cargar();
  }, [cargar]);

  const cancelarMensaje = async (mensaje) => {
    await mensajesApi.cancelar(id, mensaje.id);
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
        title="Mensajes"
        action={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialogAbierto(true)}>
            Nuevo mensaje
          </Button>
        }
      />

      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: "wrap", rowGap: 1 }}>
        {ESTADOS.map((e) => (
          <Chip
            key={e.label}
            label={e.label}
            onClick={() => setEstado(e.value)}
            color={estado === e.value ? "primary" : "default"}
          />
        ))}
      </Stack>

      {mensajes.length === 0 ? (
        <EmptyState icon={IconChat} title="No hay mensajes en este estado" description="Prueba con otro filtro o crea un nuevo mensaje." />
      ) : (
        <Stack ref={listRef} spacing={1.5}>
          {mensajes.map((msg) => (
            <Card key={msg.id} sx={{ p: 2, opacity: 0 }}>
              <Stack direction="row" alignItems="flex-start" spacing={2}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap", rowGap: 0.5 }}>
                    <Chip size="small" label={msg.tipo} />
                    <Chip size="small" label={msg.estado} color={COLOR_ESTADO[msg.estado] || "default"} />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(msg.fechaHoraEnvio).toLocaleString("es-CO")}
                    </Typography>
                  </Stack>
                  <Typography sx={{ mt: 0.75 }}>{msg.contenido}</Typography>
                </Box>
                {msg.estado === "pendiente" && (
                  <IconButton size="small" onClick={() => cancelarMensaje(msg)} title="Cancelar">
                    <CancelRoundedIcon fontSize="small" />
                  </IconButton>
                )}
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

      <MensajeFormDialog
        open={dialogAbierto}
        onClose={() => setDialogAbierto(false)}
        negocioId={id}
        plantillas={plantillas}
        onSaved={() => {
          setDialogAbierto(false);
          cargar();
        }}
      />
    </Container>
  );
}
