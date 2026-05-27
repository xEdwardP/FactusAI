-- CreateEnum
CREATE TYPE "EstadoUsuario" AS ENUM ('Activo', 'Inactivo', 'Suspendido');

-- CreateEnum
CREATE TYPE "TipoFactura" AS ENUM ('Credito', 'Contado');

-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('Ingreso', 'Gasto');

-- CreateEnum
CREATE TYPE "MedioEnvio" AS ENUM ('Email', 'WhatsApp', 'Otro');

-- CreateEnum
CREATE TYPE "EstadoEnvio" AS ENUM ('Enviado', 'Fallido', 'Entregado');

-- CreateTable
CREATE TABLE "Cliente" (
    "id" BIGSERIAL NOT NULL,
    "Nombre" VARCHAR,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empresa" (
    "id_empresa" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "ruc" VARCHAR(20),
    "correo" VARCHAR(150),
    "telefono" VARCHAR(20),
    "direccion" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empresa_pkey" PRIMARY KEY ("id_empresa")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id_usuario" SERIAL NOT NULL,
    "identificador" VARCHAR(20) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "correo" VARCHAR(150) NOT NULL,
    "contraseña" VARCHAR(255) NOT NULL,
    "estado" "EstadoUsuario" NOT NULL DEFAULT 'Activo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "usuario_empresa" (
    "id" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_empresa" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categoria_gasto" (
    "id_categoria_gasto" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categoria_gasto_pkey" PRIMARY KEY ("id_categoria_gasto")
);

-- CreateTable
CREATE TABLE "tipo_documento" (
    "id_tipo_documento" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "tipo_documento_pkey" PRIMARY KEY ("id_tipo_documento")
);

-- CreateTable
CREATE TABLE "factura" (
    "id_factura" SERIAL NOT NULL,
    "fecha" DATE NOT NULL,
    "proveedor" VARCHAR(150) NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "imagen" VARCHAR(255),
    "factura_fisica" BOOLEAN NOT NULL DEFAULT false,
    "id_tipo_factura" "TipoFactura" NOT NULL,
    "ingreso_gasto" "TipoMovimiento" NOT NULL,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_empresa" INTEGER NOT NULL,
    "id_categoria_gasto" INTEGER NOT NULL,
    "id_tipo_documento" INTEGER NOT NULL,

    CONSTRAINT "factura_pkey" PRIMARY KEY ("id_factura")
);

-- CreateTable
CREATE TABLE "detalle_envio" (
    "id_detalle_envio" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "destinatario" VARCHAR(150) NOT NULL,
    "medio_envio" "MedioEnvio" NOT NULL,
    "estado" "EstadoEnvio" NOT NULL DEFAULT 'Enviado',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "detalle_envio_pkey" PRIMARY KEY ("id_detalle_envio")
);

-- CreateTable
CREATE TABLE "detalle_envio_factura" (
    "id" SERIAL NOT NULL,
    "id_detalle_envio" INTEGER NOT NULL,
    "id_factura" INTEGER NOT NULL,

    CONSTRAINT "detalle_envio_factura_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "empresa_ruc_key" ON "empresa"("ruc");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_identificador_key" ON "usuario"("identificador");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_correo_key" ON "usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_empresa_id_usuario_id_empresa_key" ON "usuario_empresa"("id_usuario", "id_empresa");

-- CreateIndex
CREATE UNIQUE INDEX "detalle_envio_factura_id_detalle_envio_id_factura_key" ON "detalle_envio_factura"("id_detalle_envio", "id_factura");

-- AddForeignKey
ALTER TABLE "usuario_empresa" ADD CONSTRAINT "usuario_empresa_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_empresa" ADD CONSTRAINT "usuario_empresa_id_empresa_fkey" FOREIGN KEY ("id_empresa") REFERENCES "empresa"("id_empresa") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factura" ADD CONSTRAINT "factura_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factura" ADD CONSTRAINT "factura_id_empresa_fkey" FOREIGN KEY ("id_empresa") REFERENCES "empresa"("id_empresa") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factura" ADD CONSTRAINT "factura_id_categoria_gasto_fkey" FOREIGN KEY ("id_categoria_gasto") REFERENCES "categoria_gasto"("id_categoria_gasto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factura" ADD CONSTRAINT "factura_id_tipo_documento_fkey" FOREIGN KEY ("id_tipo_documento") REFERENCES "tipo_documento"("id_tipo_documento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_envio" ADD CONSTRAINT "detalle_envio_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_envio_factura" ADD CONSTRAINT "detalle_envio_factura_id_detalle_envio_fkey" FOREIGN KEY ("id_detalle_envio") REFERENCES "detalle_envio"("id_detalle_envio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_envio_factura" ADD CONSTRAINT "detalle_envio_factura_id_factura_fkey" FOREIGN KEY ("id_factura") REFERENCES "factura"("id_factura") ON DELETE RESTRICT ON UPDATE CASCADE;
