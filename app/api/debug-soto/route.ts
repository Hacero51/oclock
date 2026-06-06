import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import fs from "fs";

export async function GET() {
  const logFile = "c:/proyectos/oclock/debug_output.json";
  try {
    const person = await prisma.eperson.findFirst({
      where: { FullName: { contains: 'SOTO' } }
    });

    if (!person) {
      const errRes = { error: "No person containing SOTO found" };
      fs.writeFileSync(logFile, JSON.stringify(errRes, null, 2));
      return NextResponse.json(errRes);
    }

    const employee = await prisma.employee.findUnique({
      where: { Oid: person.Oid }
    });

    if (!employee) {
      const errRes = { error: "No employee record for SOTO" };
      fs.writeFileSync(logFile, JSON.stringify(errRes, null, 2));
      return NextResponse.json(errRes);
    }

    const now = new Date();
    const todayLiteral = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0));

    const markings = await prisma.marking.findMany({
      where: {
        Employee: person.Oid,
        Day: todayLiteral
      }
    });

    const activeShiftId = employee.CurrentShift;
    const shift = activeShiftId ? await prisma.shift.findUnique({
      where: { Oid: activeShiftId }
    }) : null;

    const shiftTimetables = activeShiftId ? await prisma.shifttimetable.findMany({
      where: { Shift: activeShiftId }
    }) : [];

    const timetablesFixed = await prisma.timetablefixed.findMany({});

    // Mapeos en memoria como en stats route
    const shiftTimetableMap = new Map<string, string>();
    shiftTimetables.forEach(st => {
      if (st.Shift && st.Timetable && st.NumberDay !== null) {
        shiftTimetableMap.set(`${st.Shift.trim()}_${st.NumberDay}`, st.Timetable.trim());
      }
    });

    const timetableFixedMap = new Map<string, { markingIn: number; delay: number }>();
    timetablesFixed.forEach(tf => {
      timetableFixedMap.set(tf.Oid.trim(), {
        markingIn: tf.MarkingIn || 0,
        delay: tf.Delay || 0
      });
    });

    const debugMarkings = markings.map(m => {
      if (!m.MarkingIn) return { marking: m, status: "no marking in" };

      const hours = m.MarkingIn.getUTCHours();
      const minutes = m.MarkingIn.getUTCMinutes();
      const seconds = m.MarkingIn.getUTCSeconds();
      const arrivalSeconds = hours * 3600 + minutes * 60 + seconds;

      const shiftClean = m.Shift?.trim() || employee.CurrentShift?.trim() || '';
      const dayOfWeek = m.Day ? new Date(m.Day).getUTCDay() : 1;
      const numberDay = dayOfWeek === 0 ? 7 : dayOfWeek;

      const timetableOid = shiftTimetableMap.get(`${shiftClean}_${numberDay}`);
      const fixedDetails = timetableOid ? timetableFixedMap.get(timetableOid) : null;

      let isLate = false;
      let limitSeconds = 0;
      if (fixedDetails) {
        limitSeconds = fixedDetails.markingIn + 600;
        isLate = arrivalSeconds > limitSeconds;
      } else {
        // fallback
        isLate = arrivalSeconds > (375 * 60);
      }

      return {
        marking: {
          Oid: m.Oid,
          Day: m.Day ? m.Day.toISOString() : null,
          MarkingIn: m.MarkingIn ? m.MarkingIn.toISOString() : null,
          Shift: m.Shift
        },
        hours,
        minutes,
        arrivalSeconds,
        shiftClean,
        dayOfWeek,
        numberDay,
        timetableOid,
        fixedDetails,
        limitSeconds,
        isLate,
        fallbackUsed: !fixedDetails
      };
    });

    const result = {
      person,
      employee,
      todayLiteral: todayLiteral.toISOString(),
      activeShiftId,
      shift,
      shiftTimetables,
      shiftTimetableMapKeys: Array.from(shiftTimetableMap.keys()),
      debugMarkings
    };

    fs.writeFileSync(logFile, JSON.stringify(result, null, 2));
    return NextResponse.json(result);

  } catch (err: any) {
    const errRes = { error: err.message, stack: err.stack };
    fs.writeFileSync(logFile, JSON.stringify(errRes, null, 2));
    return NextResponse.json(errRes);
  }
}
