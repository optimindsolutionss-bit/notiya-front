import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Stack,
  Typography,
  Button,
  Card,
  Box,
  Chip,
  IconButton,
  CircularProgress,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import * as promocionesApi from "../../api/promociones.api";
import * as productosApi from "../../api/productos.api";
import PromocionFormDialog from "./PromocionFormDialog";
import { formatPrecio } from "../../utils/currency";
import PageHeader from "../../components/layout/PageHeader";
import EmptyState from "../../components/layout/EmptyState";
import { useStaggerReveal } from "../../hooks/useRevealAnimation";
import IconTag from "~icons/solar/tag-price-linear";
import { useAuth } from "../../context/AuthContext";
import { useRolNegocio } from "../../hooks/useRolNegocio";

export default function PromocionesPage() {
  const { negocioId } = useParams();
  const id = Number(negocioId);

  const { usuario } = useAuth();
  const rol = useRolNegocio(id);
  const puedeEditar = (promo) => rol !== "promotor" || promo.creadoPor === usuario?.id;

  const [promociones, setPromociones] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, promocion: null });
  const listRef = useStaggerReveal({ translateY: 10, duration: 350, staggerDelay: 50 });

  const cargar = useCallback(async () => {
    const [promos, prods] = await Promise.all([promocionesApi.listar(id), productosApi.listar(id)]);
    setPromociones(promos);
    setProductos(prods);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    setLoading(true);
    cargar();
  }, [cargar]);

  const eliminar = async (promo) => {
    await promocionesApi.eliminar(id, promo.id);
    cargar();
  };

  const nombreProducto = (productoId) => productos.find((p) => p.id === productoId)?.nombre;
  const activaAhora = (promo) => {
    const ahora = Date.now();
    return promo.activo && new Date(promo.fechaInicio).getTime() <= ahora && ahora <= new Date(promo.fechaFin).getTime();
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
        title="Promociones"
        action={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialog({ open: true, promocion: null })}>
            Nueva promoción
          </Button>
        }
      />

      {promociones.length === 0 ? (
        <EmptyState
          icon={IconTag}
          title="Aún no tienes promociones"
          description="Se mostrarán en la Pantalla pública mientras estén activas."
        />
      ) : (
        <Stack ref={listRef} spacing={1.5}>
          {promociones.map((promo) => (
            <Card key={promo.id} sx={{ p: 2, opacity: 0 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600 }} noWrap>
                    {promo.titulo}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5, flexWrap: "wrap", rowGap: 0.5 }}>
                    <Typography variant="body2" color="primary.main" sx={{ fontWeight: 700 }}>
                      {formatPrecio(promo.precioPromocional)}
                    </Typography>
                    {nombreProducto(promo.productoId) && <Chip size="small" label={nombreProducto(promo.productoId)} />}
                    <Chip
                      size="small"
                      label={activaAhora(promo) ? "Activa" : "Inactiva"}
                      color={activaAhora(promo) ? "success" : "default"}
                      variant="outlined"
                    />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(promo.fechaInicio).toLocaleString("es-CO")} — {new Date(promo.fechaFin).toLocaleString("es-CO")}
                  </Typography>
                </Box>
                {puedeEditar(promo) && (
                  <>
                    <IconButton size="small" onClick={() => setDialog({ open: true, promocion: promo })}>
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => eliminar(promo)}>
                      <DeleteRoundedIcon fontSize="small" />
                    </IconButton>
                  </>
                )}
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

      <PromocionFormDialog
        open={dialog.open}
        onClose={() => setDialog({ open: false, promocion: null })}
        negocioId={id}
        productos={productos}
        promocion={dialog.promocion}
        onSaved={() => {
          setDialog({ open: false, promocion: null });
          cargar();
        }}
      />
    </Container>
  );
}
