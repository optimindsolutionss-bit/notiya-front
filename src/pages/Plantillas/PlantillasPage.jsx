import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Stack, Typography, Button, Card, Box, Chip, IconButton, CircularProgress } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import * as plantillasApi from "../../api/plantillas.api";
import PlantillaFormDialog from "./PlantillaFormDialog";
import { TIPOS_PLANTILLA } from "../../constants/plantillas";
import PageHeader from "../../components/layout/PageHeader";
import EmptyState from "../../components/layout/EmptyState";
import { useStaggerReveal } from "../../hooks/useRevealAnimation";
import IconDocument from "~icons/solar/document-text-linear";

export default function PlantillasPage() {
  const { negocioId } = useParams();
  const id = Number(negocioId);

  const [plantillas, setPlantillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, plantilla: null });
  const listRef = useStaggerReveal({ translateY: 10, duration: 350, staggerDelay: 50 });

  const cargar = useCallback(async () => {
    setPlantillas(await plantillasApi.listar(id));
    setLoading(false);
  }, [id]);

  useEffect(() => {
    setLoading(true);
    cargar();
  }, [cargar]);

  const eliminar = async (plantilla) => {
    await plantillasApi.eliminar(id, plantilla.id);
    cargar();
  };

  const etiquetaTipo = (tipo) => TIPOS_PLANTILLA.find((t) => t.value === tipo)?.label || tipo;

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
        title="Plantillas de mensajes"
        action={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialog({ open: true, plantilla: null })}>
            Nueva plantilla
          </Button>
        }
      />

      {plantillas.length === 0 ? (
        <EmptyState
          icon={IconDocument}
          title="Aún no tienes plantillas"
          description="Úsalas para reutilizar textos frecuentes al crear un mensaje."
        />
      ) : (
        <Stack ref={listRef} spacing={1.5}>
          {plantillas.map((plantilla) => (
            <Card key={plantilla.id} sx={{ p: 2, opacity: 0 }}>
              <Stack direction="row" alignItems="flex-start" spacing={2}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography sx={{ fontWeight: 600 }}>{plantilla.nombre}</Typography>
                    <Chip size="small" label={etiquetaTipo(plantilla.tipo)} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {plantilla.contenido}
                  </Typography>
                </Box>
                <IconButton size="small" onClick={() => setDialog({ open: true, plantilla })}>
                  <EditRoundedIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => eliminar(plantilla)}>
                  <DeleteRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

      <PlantillaFormDialog
        open={dialog.open}
        onClose={() => setDialog({ open: false, plantilla: null })}
        negocioId={id}
        plantilla={dialog.plantilla}
        onSaved={() => {
          setDialog({ open: false, plantilla: null });
          cargar();
        }}
      />
    </Container>
  );
}
