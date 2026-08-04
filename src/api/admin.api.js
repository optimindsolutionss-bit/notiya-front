import api from "./axios";
import { snakeToCamelShallow } from "./caseUtils";

function normalizeNegocioAdmin(row) {
  const negocio = snakeToCamelShallow(row);
  return {
    ...negocio,
    dueno:
      negocio.duenoId != null
        ? { id: negocio.duenoId, nombre: negocio.duenoNombre, correo: negocio.duenoCorreo }
        : null,
  };
}

export async function listarTodosNegocios() {
  const { data } = await api.get("/admin/negocios");
  return data.negocios.map(normalizeNegocioAdmin);
}

export async function crearNegocioParaUsuario({ usuarioId, nombre, tipoNegocio, direccion, telefonoContacto, correoContacto }) {
  const { data } = await api.post("/admin/negocios", {
    usuarioId,
    nombre,
    tipoNegocio,
    direccion,
    telefonoContacto,
    correoContacto,
  });
  return snakeToCamelShallow(data.negocio);
}

export async function buscarUsuarioPorCorreo(correo) {
  const { data } = await api.get("/admin/usuarios", { params: { correo } });
  return data.usuarios;
}
