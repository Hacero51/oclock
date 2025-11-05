"use client";

import { useState, useMemo } from "react";
import Tabla from "../../../../components/Table";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/Button";

export default function EmpleadosPage() {

    const columnas = ["Numero lector","Oid","Documento", "Nombre a mostrar","Departamento", "Turno", "Valor Hora"]; 
const datos = [ 
  { "Número Lector": "3", "Oid": "8758617F-1A73-49FE-8644-B23F2A2115F5", "Documento": "14324537", "Nombre a mostrar": "FABIO LEONARDO BELTRAN BUSTOS", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 3.053,96" },
  { "Número Lector": "7", "Oid": "3031BD86-4634-45CE-93FB-8C7EF6CB5733", "Documento": "82395158", "Nombre a mostrar": "CARLOS ANDRES BAQUERO PINTO", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 3.789,58" },
  { "Número Lector": "9", "Oid": "675980F9-AAEC-4E9B-AB07-865437345D91", "Documento": "52207392", "Nombre a mostrar": "ARGENIS GARZON GONZALEZ", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 2 PM - 10 PM", "Valor Hora": "$ 3.655,83" },
  { "Número Lector": "15", "Oid": "21125B7A-1F01-4B63-8497-CD7461011B8F", "Documento": "79716275", "Nombre a mostrar": "JOSE RAUL RODRIGUEZ LAGUNA", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 2 PM - 10 PM", "Valor Hora": "$ 4.284,46" },
  { "Número Lector": "29", "Oid": "1F284DC5-4B7F-4139-9B5F-E7CB0503AB93", "Documento": "79127045", "Nombre a mostrar": "MAURICIO GARCIA GONZALEZ", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 4.971,04" },
  { "Número Lector": "34", "Oid": "054C6A80-3271-42F1-B60D-E58A4FF17AF4", "Documento": "79829659", "Nombre a mostrar": "JAVIER NAVAS ROMERO", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 7.500,00" },
  { "Número Lector": "39", "Oid": "5D868C92-235E-4112-929F-ACD7978DB469", "Documento": "1069832081", "Nombre a mostrar": "YASMIN FAYNORI CELIS GONZALEZ", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 2.979,17" },
  { "Número Lector": "48", "Oid": "4228FA7F-F0FD-421A-9501-B7304AF2ED48", "Documento": "63343312", "Nombre a mostrar": "MAXIMA SERPA JIMENEZ", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 2.942,50" },
  { "Número Lector": "52", "Oid": "78A01F02-B729-449C-999A-FEE9ACF7BAC6", "Documento": "79518210", "Nombre a mostrar": "PEDRO VICENTE QUINTERO TORRES", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 4.904,17" },
  { "Número Lector": "55", "Oid": "7813C753-0411-436B-8ACD-8057A63E3B72", "Documento": "1020716995", "Nombre a mostrar": "DEIMER ENRIQUE SALGADO JIMENEZ", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 3.045,04" },
  { "Número Lector": "85", "Oid": "1380619B-F9F2-458E-A2B0-8B54266D5FAF", "Documento": "74327933", "Nombre a mostrar": "VICENSIO ANGULO ROJAS", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 5.000,00" },
  { "Número Lector": "89", "Oid": "DB423B60-F3C3-4A0E-95D4-173F41982BE1", "Documento": "80205538", "Nombre a mostrar": "CARLOS ARTURO AGUDELO DELGADO", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 3.291,67" },
  { "Número Lector": "167", "Oid": "19574ADE-4233-4A0A-B9DD-007E5B93B9DD", "Documento": "79838859", "Nombre a mostrar": "EDWIN ALEXANDER OLAYA GONZALEZ", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 3.566,67" },
  { "Número Lector": "184", "Oid": "03397BB3-3E05-4BA4-A70B-4C79CE6B19FC", "Documento": "80769405", "Nombre a mostrar": "LUIS CARLOS DIAZ RODRIGUEZ", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 2.958,33" },
  { "Número Lector": "237", "Oid": "B438F4FD-CB29-48D7-AB90-3EA4D471F9FE", "Documento": "80019357", "Nombre a mostrar": "DAVID ALEJANDRO MARTINEZ SANCHEZ", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 3.073,82" },
  { "Número Lector": "268", "Oid": "288C9ECC-D7C7-402A-A606-78F4D5378D17", "Documento": "79493352", "Nombre a mostrar": "JHON WILSON BEJARANO ESCOBAR", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 4.012,50" },
  { "Número Lector": "328", "Oid": "71181F58-DFD9-4F3C-8411-53989FF06749", "Documento": "1012400662", "Nombre a mostrar": "GEIDY ANDREA VEGAS CARO", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 3.073,82" },
  { "Número Lector": "370", "Oid": "8AEE9ACD-CF43-4ACD-8B00-17A82B065BB1", "Documento": "1127659911", "Nombre a mostrar": "SIMON BAENA VANEGAS", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 2 PM - 10 PM", "Valor Hora": "$ 3.073,82" },
  { "Número Lector": "390", "Oid": "C9614C56-07A5-4F97-9679-36E107050988", "Documento": "80132842", "Nombre a mostrar": "MAURICIO VERA RINCON", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 2 PM - 10 PM", "Valor Hora": "$ 0,00" },
  { "Número Lector": "413", "Oid": "00862259-9E28-40B5-BB8D-976B89E0F61F", "Documento": "1024471366", "Nombre a mostrar": "EDGAR HERNANDO LATORRE CUITIVA", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 0,00" },
  { "Número Lector": "429", "Oid": "24619E65-C4DF-4C3D-B3C5-2C6623A12102", "Documento": "23946448", "Nombre a mostrar": "DEISY CAROLINA RAMIREZ BECERRA", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 0,00" },
  { "Número Lector": "445", "Oid": "73DE3B70-AA6F-4ADC-B13A-6D126AD628C5", "Documento": "80311742", "Nombre a mostrar": "JUAN CARLOS PEDRAZA RODRIGUEZ", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 0,00" },
  { "Número Lector": "449", "Oid": "65264C37-D314-4CE8-BE9C-B1CE5301C75C", "Documento": "36160949", "Nombre a mostrar": "NILDA ACEVEDO MORALES", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 0,00" },
  { "Número Lector": "455", "Oid": "4B82AAA5-0B12-4A16-A235-F855CA55AC90", "Documento": "1079177768", "Nombre a mostrar": "CINDY PAOLA CRUZ", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 0,00" },
  { "Número Lector": "492", "Oid": "B443AAC4-066A-4C38-B468-18B2916DAF3C", "Documento": "1070975442", "Nombre a mostrar": "YESIKA JULEIDY URUEÑA HERNANDEZ", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 0,00" },
  { "Número Lector": "532", "Oid": "0495B5FF-F08A-47F2-AEE6-4A6EFB2FE77F", "Documento": "10124416521", "Nombre a mostrar": "DAIRO HERNAN GOMEZ VARGAS", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 0,00" },
  { "Número Lector": "537", "Oid": "DF827C4A-0501-465B-A7CA-A8F11A4B7DB2", "Documento": "1070976200", "Nombre a mostrar": "YEFER DAVID BAUTISTA MELO", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 0,00" },
  { "Número Lector": "569", "Oid": "F973F312-AB96-47F9-9B70-0DD63210CC15", "Documento": "52861418", "Nombre a mostrar": "ADRIANA LUCIA BARBOSA MAHECHA", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 0,00" },
  { "Número Lector": "575", "Oid": "E8E24ACC-7589-49BE-8EDE-1819E985E65C", "Documento": "1018431320", "Nombre a mostrar": "LEIDY ALEXANDRA HOLGUIN VELANDIA", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 0,00" },
  { "Número Lector": "636", "Oid": "BA7EA194-1DD6-4893-BE27-5F40B789515B", "Documento": "1014291131", "Nombre a mostrar": "DANIEL FELIPE MARTINEZ CASTRO", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 0,00" },
  { "Número Lector": "664", "Oid": "9E35FE9F-7E4E-4905-9D89-3D0B5B292CA9", "Documento": "1757068", "Nombre a mostrar": "LUIS ARMANDO GUZMAN PEREIRA", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 0,00" },
  { "Número Lector": "713", "Oid": "D4CD56E9-5A6F-4B61-97CE-7B999ED75785", "Documento": "113055131", "Nombre a mostrar": "HUMBERTO PALMA GONZALEZ", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 0,00" },
  { "Número Lector": "718", "Oid": "85FB2D04-8C46-46EC-9127-97B4B9FDFBEC", "Documento": "1034309947", "Nombre a mostrar": "MARIA HELENA DELGADO RUIZ", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 0,00" },
  { "Número Lector": "751", "Oid": "B4F69910-21BD-4057-A027-3915175B3170", "Documento": "1097401044", "Nombre a mostrar": "NATALIA CAROLINA ARANGO GALLEGO", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 0,00" },
  { "Número Lector": "752", "Oid": "21D67A27-288C-41F6-8A51-2F521F300E28", "Documento": "1109847979", "Nombre a mostrar": "INDIRA DAYANA ARAGON ROJAS", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 0,00" },
  { "Número Lector": "782", "Oid": "CAD2D30D-1CA6-45A8-B6C7-20BCA68BDA1D", "Documento": "81754095", "Nombre a mostrar": "FREDY ERNESTO BAUTISTA BAUTISTA", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 0,00" },
  { "Número Lector": "783", "Oid": "17C7F817-2DF2-499C-A52B-829AA194377C", "Documento": "1003311146", "Nombre a mostrar": "DAGER OCORO RAMIREZ", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 0,00" },
  { "Número Lector": "799", "Oid": "35B571E7-D1B7-46A1-9415-B5DC0F85E9FA", "Documento": "1049029241", "Nombre a mostrar": "CLAUDIA MILENA RUBIANO MARTINEZ", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 0,00" },
  { "Número Lector": "810", "Oid": "B55857DA-BBBF-4D92-8411-76F215E8DB00", "Documento": "1009213", "Nombre a mostrar": "LEIDERMAN LEANDRO TORREALBA MANZANILLA", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 0,00" },
  { "Número Lector": "836", "Oid": "28F75CCB-854B-4BC2-82A5-107DCAE9A556", "Documento": "1005854050", "Nombre a mostrar": "JAIRO DARVINSON MORENO MOLINA", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 0,00" },
  { "Número Lector": "838", "Oid": "10F60DD0-CD52-47C9-990F-E1ACBF527B29", "Documento": "1003381616", "Nombre a mostrar": "CAMILO ANDRES CUDRIS QUESADA", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 0,00" },
  { "Número Lector": "848", "Oid": "8A0A3762-A005-43EF-AE24-A5C60961914A", "Documento": "1124070064", "Nombre a mostrar": "ALBA RAQUELI URIANA", "Departamento": "PRENSADOS/PLANTA", "Turno Actual": "PLANTA 6 AM - 2 PM", "Valor Hora": "$ 0,00" }
];

 const [busqueda, setBusqueda] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [turno, setTurno] = useState("");
  const [openAdvanced, setOpenAdvanced] = useState(false);

  // Filtros optimizados
  const datosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase();
    return datos.filter((item) => {
      const coincideBusqueda =
        item["Nombre a mostrar"].toLowerCase().includes(texto) ||
        item["Documento"].includes(busqueda);
      const coincideDepartamento =
        departamento === "" || item["Departamento"] === departamento;
      const coincideTurno = turno === "" || item["Turno Actual"] === turno;
      return coincideBusqueda && coincideDepartamento && coincideTurno;
    });
  }, [busqueda, departamento, turno]);

  const departamentos = useMemo(
    () => Array.from(new Set(datos.map((d) => d["Departamento"]))),
    [datos]
  );
  const turnos = useMemo(
    () => Array.from(new Set(datos.map((d) => d["Turno Actual"]))),
    [datos]
  );

  return (
    <div className="space-y-6">
      {/* 🔹 Encabezado */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Empleados</h1>
        <Button
          variant="outline"
          onClick={() => setOpenAdvanced(true)}
          className="flex items-center gap-2"
        >
          🧮 Filtros avanzados
        </Button>
      </div>

      {/* 🔹 Tabla de empleados */}
      <Tabla columnas={columnas} datos={datosFiltrados} />

      {/* 🔹 Modal con filtros */}
      {openAdvanced && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[450px] space-y-5">
            <h2 className="text-xl font-semibold text-gray-800">
              Filtros avanzados
            </h2>

            <div className="space-y-4">
              <Input
                placeholder="Buscar por nombre o documento..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />

              <Select onValueChange={setDepartamento} value={departamento}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filtrar por departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {departamentos.map((dep) => (
                    <SelectItem key={dep} value={dep}>
                      {dep}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={setTurno} value={turno}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filtrar por turno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {turnos.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setOpenAdvanced(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setOpenAdvanced(false)}>Aplicar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}