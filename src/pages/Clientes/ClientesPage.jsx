import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Stack, Typography, Card, Box, IconButton, CircularProgress, Link } from "@mui/material";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import * as clientesApi from "../../api/clientes.api";
import PageHeader from "../../components/layout/PageHeader";
import EmptyState from "../../components/layout/EmptyState";
import { useStaggerReveal } from "../../hooks/useRevealAnimation";
import IconUsers from "~icons/solar/users-group-rounded-linear";

export default function ClientesPage() {
  const { negocioId } = useParams();
  const id = Number(negocioId);

  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiado, setCopiado] = useState(false);
  const listRef = useStaggerReveal({ translateY: 10, duration: 350, staggerDelay: 50 });

  const enlaceSuscripcion = `${window.location.origin}/suscribirse/${id}`;

  const cargar = useCallback(async () => {
    setClientes(await clientesApi.listar(id));
    setLoading(false);
  }, [id]);

  useEffect(() => {
    setLoading(true);
    cargar();
  }, [cargar]);

  const darDeBaja = async (cliente) => {
    await clientesApi.darDeBaja(id, cliente.id);
    cargar();
  };

  const copiarEnlace = async () => {
    await navigator.clipboard.writeText(enlaceSuscripcion);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
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
        title="Clientes suscritos"
        subtitle={`${clientes.length} cliente${clientes.length !== 1 ? "s" : ""} recibiendo tus avisos por WhatsApp`}
      />

      <Card sx={{ p: 2, mb: 3, bgcolor: "background.neutral" }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Comparte este enlace para que tus clientes se suscriban:
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Link href={enlaceSuscripcion} target="_blank" rel="noopener" sx={{ wordBreak: "break-all", fontSize: "0.875rem" }}>
            {enlaceSuscripcion}
          </Link>
          <IconButton size="small" onClick={copiarEnlace}>
            <ContentCopyRoundedIcon fontSize="small" />
          </IconButton>
          {copiado && (
            <Typography variant="caption" color="success.main">
              ¡Copiado!
            </Typography>
          )}
        </Stack>
      </Card>

      {clientes.length === 0 ? (
        <EmptyState
          icon={IconUsers}
          title="Todavía no tienes clientes suscritos"
          description="Comparte el enlace de arriba con tus clientes."
        />
      ) : (
        <Stack ref={listRef} spacing={1.5}>
          {clientes.map((cliente) => (
            <Card key={cliente.id} sx={{ p: 2, display: "flex", alignItems: "center", gap: 2, opacity: 0 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600 }}>{cliente.nombre || "Sin nombre"}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {cliente.whatsappNumero}
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => darDeBaja(cliente)} title="Dar de baja">
                <DeleteRoundedIcon fontSize="small" />
              </IconButton>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}
