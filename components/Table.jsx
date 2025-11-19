import PropTypes from "prop-types";

function Tabla({ columnas, datos, onRowClick }) {
  return (
    <div className="w-full">
      
      {/* Tabla Desktop */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm hidden md:block">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-blue-900 text-white">
            <tr>
              {columnas.map((col) => (
                <th key={col} className="px-4 py-2 text-left font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {datos.map((fila, i) => (
              <tr
                key={i}
                className="hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => onRowClick && onRowClick(fila)}
              >
                {columnas.map((col) => (
                  <td key={col} className="px-4 py-2 border-t">
                    {fila[col]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista Mobile */}
      <div className="md:hidden space-y-3 mt-3">
        {datos.map((fila, i) => (
          <div
            key={i}
            className="border rounded-lg p-4 shadow bg-white cursor-pointer hover:bg-gray-50"
            onClick={() => onRowClick && onRowClick(fila)}
          >
            {columnas.map((col) => (
              <div key={col} className="flex justify-between py-1">
                <span className="text-gray-500 text-xs">{col}:</span>
                <span className="text-gray-900 font-medium ml-3 text-right">
                  {fila[col]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

    </div>
  );
}

Tabla.propTypes = {
  columnas: PropTypes.arrayOf(PropTypes.string).isRequired,
  datos: PropTypes.arrayOf(PropTypes.object).isRequired,
  onRowClick: PropTypes.func,
};

export default Tabla;
