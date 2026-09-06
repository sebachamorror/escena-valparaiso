"use client";

export function PrintButton() {
  return (
    <button type="button" className="btn btn-primary btn-sm" onClick={() => window.print()}>
      Descargar / imprimir PDF
    </button>
  );
}
