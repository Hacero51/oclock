
import {
  Building2,
  Clock,
  Fingerprint,
  CalendarSync,
  CalendarCheck2,
  Folders,
  ShieldUser,
  Home,
  Users,
  NotebookTabs,
  FolderTree,
  Calendar,
  FileText,
  Settings
} from "lucide-react";

export const ALL_SIDEBAR_ITEMS = [
  {
    id: "empresa",
    title: "Empresa",
    icon: "Building2",
    subItems: [
      { id: "empleados", title: "Empleados", path: "/dashboard/empresa/empleados", icon: "Users" },
      { id: "departamentos", title: "Departamentos", path: "/dashboard/empresa/departamentos", icon: "FolderTree" },
      { id: "centrocostos", title: "Centros de Costos", path: "/dashboard/empresa/centrocostos", icon: "NotebookTabs" },
    ],
  },
  {
    id: "turnos",
    title: "Turnos",
    icon: "CalendarSync",
    subItems: [
      { id: "turnos_list", title: "Turnos", path: "/dashboard/turnos/turnos", icon: "Calendar" },
      { id: "horarios", title: "Horarios", path: "/dashboard/turnos/horarios", icon: "Clock" },
    ],
  },
  {
    id: "asistencia",
    title: "Asistencia",
    icon: "CalendarCheck2",
    subItems: [
      { id: "registros", title: "Registros", path: "/dashboard/asistencia/registros", icon: "FileText" },
      { id: "marcaciones", title: "Marcaciones", path: "/dashboard/asistencia/marcaciones", icon: "Fingerprint" },
      { id: "permisoseincapacidades", title: "Permisos e Incapacidades", path: "/dashboard/asistencia/permisoseincapacidades", icon: "FileText" },
    ],
  },
  {
    id: "dispositivos",
    title: "Dispositivos",
    icon: "Fingerprint",
    path: "/dashboard/dispositivos",
  },
  {
    id: "reportes",
    title: "Reportes",
    icon: "FileText",
    subItems: [{ id: "informes", title: "Informes", path: "/dashboard/reportes/informes", icon: "FileText" }],
  },
  {
    id: "maestros",
    title: "Maestros",
    icon: "Folders",
    subItems: [
      { id: "maestros_asistencia", title: "Asistencia", path: "/dashboard/maestros/asistencia", icon: "CalendarCheck2" },
      { id: "diasfestivos", title: "Días Festivos", path: "/dashboard/maestros/diasfestivos", icon: "Calendar" },
    ],
  },
  {
    id: "administracion",
    title: "Administración",
    icon: "ShieldUser",
    subItems: [
      { id: "configuracion", title: "Configuración", path: "/dashboard/administracion/configuracion", icon: "Settings" },
      { id: "usuario_admin", title: "Usuario", path: "/dashboard/administracion/usuario", icon: "Users" },
      { id: "logs", title: "Logs de Auditoría", path: "/dashboard/administracion/logs", icon: "FileText" },
    ],
  },
];

export const getIcon = (name: string) => {
  const icons: any = {
    Building2, Clock, Fingerprint, CalendarSync, CalendarCheck2, Folders, ShieldUser, Home, Users, NotebookTabs, FolderTree, Calendar, FileText, Settings
  };
  return icons[name] || FileText;
};
