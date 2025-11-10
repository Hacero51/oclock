import PropTypes from 'prop-types';

function Tabla({ columnas, datos, onRowClick }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full text-sm text-gray-700">
        <thead className="bg-gray-100 text-gray-800">
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
  );
}
Tabla.propTypes = {
  columnas: PropTypes.arrayOf(PropTypes.string).isRequired,
  datos: PropTypes.arrayOf(PropTypes.object).isRequired,
  onRowClick: PropTypes.func,
};

export default Tabla;
