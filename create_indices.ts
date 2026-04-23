import prisma from './lib/prisma';

async function main() {
  console.log('--- Iniciando optimización de base de datos ---');
  
  try {
    console.log('1. Creando índice en marking(Day)...');
    await prisma.$executeRaw`CREATE INDEX idx_marking_day ON marking(Day)`;
    console.log('>> Índice idx_marking_day creado.');
  } catch (e: any) {
    if (e.message.includes('Duplicate key name')) {
        console.log('>> El índice idx_marking_day ya existe.');
    } else {
        console.log('>> Error en idx_marking_day:', e.message);
    }
  }

  try {
    console.log('2. Creando índice en attendancedetail(Day)...');
    await prisma.$executeRaw`CREATE INDEX idx_attdet_day ON attendancedetail(Day)`;
    console.log('>> Índice idx_attdet_day creado.');
  } catch (e: any) {
    if (e.message.includes('Duplicate key name')) {
        console.log('>> El índice idx_attdet_day ya existe.');
    } else {
        console.log('>> Error en idx_attdet_day:', e.message);
    }
  }

  console.log('--- Optimización completada ---');
}

main()
  .catch((e) => {
    console.error('Error fatal:', e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
