import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Container, Stack, Button, Chip, CircularProgress } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import * as categoriasApi from "../../api/categorias.api";
import * as productosApi from "../../api/productos.api";
import CategoriaManager from "./CategoriaManager";
import ProductoFormDialog from "./ProductoFormDialog";
import ProductoList from "./ProductoList";
import PageHeader from "../../components/layout/PageHeader";

export default function ProductosPage() {
  const { negocioId } = useParams();
  const id = Number(negocioId);

  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState(null);
  const [categoriasAbierto, setCategoriasAbierto] = useState(false);
  const [productoDialog, setProductoDialog] = useState({ open: false, producto: null });

  const cargar = useCallback(async () => {
    const [cats, prods] = await Promise.all([categoriasApi.listar(id), productosApi.listar(id)]);
    setCategorias(cats);
    setProductos(prods);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    setLoading(true);
    cargar();
  }, [cargar]);

  const productosFiltrados = filtroCategoria
    ? productos.filter((p) => p.categoriaId === filtroCategoria)
    : productos;

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
        title="Productos"
        action={
          <Stack direction="row" spacing={1.5}>
            <Button startIcon={<CategoryRoundedIcon />} onClick={() => setCategoriasAbierto(true)}>
              Categorías
            </Button>
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setProductoDialog({ open: true, producto: null })}>
              Nuevo producto
            </Button>
          </Stack>
        }
      />

      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: "wrap", rowGap: 1 }}>
        <Chip
          label="Todos"
          onClick={() => setFiltroCategoria(null)}
          color={filtroCategoria === null ? "primary" : "default"}
        />
        {categorias.map((cat) => (
          <Chip
            key={cat.id}
            label={cat.nombre}
            onClick={() => setFiltroCategoria(cat.id)}
            color={filtroCategoria === cat.id ? "primary" : "default"}
          />
        ))}
      </Stack>

      <ProductoList
        productos={productosFiltrados}
        categorias={categorias}
        negocioId={id}
        onEditar={(producto) => setProductoDialog({ open: true, producto })}
        onEliminado={cargar}
        onCambiado={cargar}
      />

      <CategoriaManager
        open={categoriasAbierto}
        onClose={() => setCategoriasAbierto(false)}
        negocioId={id}
        categorias={categorias}
        onChange={cargar}
      />

      <ProductoFormDialog
        open={productoDialog.open}
        onClose={() => setProductoDialog({ open: false, producto: null })}
        negocioId={id}
        categorias={categorias}
        producto={productoDialog.producto}
        onSaved={() => {
          setProductoDialog({ open: false, producto: null });
          cargar();
        }}
      />
    </Container>
  );
}
