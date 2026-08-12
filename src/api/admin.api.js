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

export async function eliminarNegocio(negocioId) {
  await api.delete(`/admin/negocios/${negocioId}`);
}

export async function buscarUsuarioPorCorreo(correo) {
  const { data } = await api.get("/admin/usuarios", { params: { correo } });
  return data.usuarios;
}

export async function listarUsuarios() {
  const { data } = await api.get("/admin/usuarios");
  return data.usuarios.map(snakeToCamelShallow);
}

export async function actualizarSuperAdmin(usuarioId, esSuperAdmin) {
  const { data } = await api.patch(`/admin/usuarios/${usuarioId}/superadmin`, { esSuperAdmin });
  return snakeToCamelShallow(data.usuario);
}
