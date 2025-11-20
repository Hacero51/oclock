import { NextResponse } from "next/server";

export async function GET() {
  const empleados = [
    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },
        {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    },    {
      "Número Lector": "3",
      "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5",
      "Documento": "14324537",
      "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.053,96"
    },
    {
      "Número Lector": "7",
      "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733",
      "Documento": "82395158",
      "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO",
      "Departamento": "PRENSADOS/PLANTA",
      "Turno Actual": "PLANTA 6 AM - 2 PM",
      "Valor Hora": "$ 3.789,58"
    }
  ];

  return NextResponse.json(empleados);
}

