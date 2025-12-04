import PropTypes from "prop-types";

function Tabla({ columnas, datos, onRowClick }) {
  return (
    <div className="w-full">

      {/* Tabla Desktop */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/80 border-b border-gray-200">
            <tr>
              {columnas.map((col) => (
                <th key={col} className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {datos.map((fila, i) => (
              <tr
                key={i}
                className="hover:bg-indigo-50/30 cursor-pointer transition-colors duration-200 group"
                onClick={() => onRowClick && onRowClick(fila)}
              >
                {columnas.map((col) => (
                  <td key={col} className="px-6 py-4 text-gray-700 font-medium group-hover:text-indigo-900">
                    {fila[col]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista Mobile */}
      <div className="md:hidden space-y-4 mt-4">
        {datos.map((fila, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-xl p-5 shadow-sm bg-white cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.99]"
            onClick={() => onRowClick && onRowClick(fila)}
          >
            {columnas.map((col) => (
              <div key={col} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wide">{col}</span>
                <span className="text-gray-900 font-medium ml-4 text-right">
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
