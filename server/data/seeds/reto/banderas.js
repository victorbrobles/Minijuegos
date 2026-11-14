// server/data/seeds/reto/banderas.js — países con su código ISO (la bandera se forma con el emoji) y continente
const P = (iso, nombre, cont) => ({ iso, nombre, cont });
export const PAISES = [
  P('ES', 'España', 'eu'), P('PT', 'Portugal', 'eu'), P('FR', 'Francia', 'eu'), P('IT', 'Italia', 'eu'), P('DE', 'Alemania', 'eu'), P('GB', 'Reino Unido', 'eu'),
  P('IE', 'Irlanda', 'eu'), P('NL', 'Países Bajos', 'eu'), P('BE', 'Bélgica', 'eu'), P('LU', 'Luxemburgo', 'eu'), P('CH', 'Suiza', 'eu'), P('AT', 'Austria', 'eu'),
  P('PL', 'Polonia', 'eu'), P('CZ', 'República Checa', 'eu'), P('SK', 'Eslovaquia', 'eu'), P('HU', 'Hungría', 'eu'), P('RO', 'Rumanía', 'eu'), P('BG', 'Bulgaria', 'eu'),
  P('GR', 'Grecia', 'eu'), P('HR', 'Croacia', 'eu'), P('SI', 'Eslovenia', 'eu'), P('RS', 'Serbia', 'eu'), P('UA', 'Ucrania', 'eu'), P('SE', 'Suecia', 'eu'),
  P('NO', 'Noruega', 'eu'), P('FI', 'Finlandia', 'eu'), P('DK', 'Dinamarca', 'eu'), P('IS', 'Islandia', 'eu'), P('EE', 'Estonia', 'eu'), P('LV', 'Letonia', 'eu'),
  P('LT', 'Lituania', 'eu'), P('MT', 'Malta', 'eu'), P('AL', 'Albania', 'eu'),
  P('US', 'Estados Unidos', 'am'), P('CA', 'Canadá', 'am'), P('MX', 'México', 'am'), P('CU', 'Cuba', 'am'), P('JM', 'Jamaica', 'am'), P('PA', 'Panamá', 'am'),
  P('CR', 'Costa Rica', 'am'), P('GT', 'Guatemala', 'am'), P('HN', 'Honduras', 'am'), P('CO', 'Colombia', 'am'), P('VE', 'Venezuela', 'am'), P('EC', 'Ecuador', 'am'),
  P('PE', 'Perú', 'am'), P('BO', 'Bolivia', 'am'), P('CL', 'Chile', 'am'), P('AR', 'Argentina', 'am'), P('UY', 'Uruguay', 'am'), P('PY', 'Paraguay', 'am'), P('BR', 'Brasil', 'am'),
  P('MA', 'Marruecos', 'af'), P('DZ', 'Argelia', 'af'), P('TN', 'Túnez', 'af'), P('EG', 'Egipto', 'af'), P('SN', 'Senegal', 'af'), P('NG', 'Nigeria', 'af'),
  P('GH', 'Ghana', 'af'), P('CM', 'Camerún', 'af'), P('CI', 'Costa de Marfil', 'af'), P('KE', 'Kenia', 'af'), P('ET', 'Etiopía', 'af'), P('ZA', 'Sudáfrica', 'af'),
  P('JP', 'Japón', 'as'), P('CN', 'China', 'as'), P('KR', 'Corea del Sur', 'as'), P('IN', 'India', 'as'), P('PK', 'Pakistán', 'as'), P('TH', 'Tailandia', 'as'),
  P('VN', 'Vietnam', 'as'), P('ID', 'Indonesia', 'as'), P('PH', 'Filipinas', 'as'), P('TR', 'Turquía', 'as'), P('IL', 'Israel', 'as'), P('SA', 'Arabia Saudí', 'as'),
  P('QA', 'Catar', 'as'), P('IR', 'Irán', 'as'), P('AU', 'Australia', 'oc'), P('NZ', 'Nueva Zelanda', 'oc')
];
export const bandera = (iso) => String.fromCodePoint(...[...iso].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
