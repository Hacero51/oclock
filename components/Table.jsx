import PropTypes from 'prop-types';

function Tabla({ columnas, datos }) {
  return (
    <div className="bg-white rounded-xl shadow overflow-x-auto">
      <table className="min-w-full border border-gray-200 text-sm">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            {columnas.map((col) => (
              <th key={col} className="p-2 border text-left">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {datos.map((fila, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {Object.values(fila).map((valor, j) => (
                <td key={j} className="p-2 border">
                  {valor}
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
};

export default Tabla;
