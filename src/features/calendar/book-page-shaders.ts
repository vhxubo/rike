export const BOOK_PAGE_VERTEX_SHADER = `
attribute vec2 a_position;

uniform float u_progress;
uniform float u_reverse;
uniform float u_pointer_y;
uniform float u_corner_y;
uniform vec2 u_shadow_offset;
uniform float u_shadow_pass;

varying vec2 v_uv;
varying float v_facing;
varying float v_height;
varying float v_fold_light;

const float PI = 3.141592653589793;

void main() {
  float u = a_position.x;
  float v = a_position.y;
  float t = mix(u_progress, 1.0 - u_progress, u_reverse);
  float phase = sin(PI * t);

  // Build the physical fold from the perpendicular bisector between the
  // original free corner and the constrained drag point.
  float cornerY = u_corner_y;
  vec2 corner = vec2(1.0, cornerY);
  vec2 dragPoint = vec2(
    1.0 - 2.0 * t,
    mix(cornerY, u_pointer_y, smoothstep(0.0, 0.28, t))
  );
  vec2 delta = corner - dragPoint;
  float deltaLength = length(delta);
  vec2 foldNormal = deltaLength > 0.0001 ? delta / deltaLength : vec2(1.0, 0.0);
  vec2 foldCenter = (corner + dragPoint) * 0.5;

  // As the page reaches the far side it settles flat to the left of the
  // fixed spine, regardless of which corner initiated the turn.
  float settle = smoothstep(0.72, 1.0, t);
  foldNormal = normalize(mix(foldNormal, vec2(1.0, 0.0), settle));
  foldCenter = mix(foldCenter, vec2(0.0, 0.5), settle);
  vec2 foldTangent = vec2(-foldNormal.y, foldNormal.x);

  vec2 point = vec2(u, v);
  vec2 relative = point - foldCenter;
  float signedDistance = dot(relative, foldNormal);
  float tangentDistance = dot(relative, foldTangent);
  float radius = mix(0.0025, 0.155, phase);
  float halfArc = PI * radius;
  float mappedNormal = signedDistance;
  float z = 0.0;
  float facing = 1.0;

  if (signedDistance > 0.0 && signedDistance < halfArc) {
    float curlAngle = signedDistance / radius;
    mappedNormal = radius * sin(curlAngle);
    z = radius * (1.0 - cos(curlAngle));
    facing = cos(curlAngle);
  } else if (signedDistance >= halfArc) {
    mappedNormal = -(signedDistance - halfArc);
    z = 2.0 * radius;
    facing = -1.0;
  }

  vec2 mapped = foldCenter + foldTangent * tangentDistance + foldNormal * mappedNormal;

  // Keep the complete x=0 binding edge pinned to the left spine.
  float spinePin = smoothstep(0.0, 0.035, u);
  mapped = mix(point, mapped, spinePin);
  z *= spinePin;
  facing = mix(1.0, facing, spinePin);
  float x = mapped.x;
  float y = mapped.y;

  if (u_shadow_pass > 0.5) {
    x += z * 0.13 + u_shadow_offset.x;
    y += u_shadow_offset.y;
    z = 0.0;
  }

  float perspective = 1.0 / (1.0 + max(z, -0.75) * 0.2);
  gl_Position = vec4(x * perspective, (1.0 - 2.0 * y) * perspective, -z * 0.08, 1.0);

  v_uv = a_position;
  v_facing = facing;
  v_height = abs(z);
  v_fold_light = phase;
}
`

export const BOOK_PAGE_FRAGMENT_SHADER = `
precision mediump float;

uniform sampler2D u_texture;
uniform float u_shadow_pass;
uniform float u_shadow_alpha;
uniform vec3 u_paper_color;
uniform vec3 u_shadow_color;

varying vec2 v_uv;
varying float v_facing;
varying float v_height;
varying float v_fold_light;

void main() {
  if (u_shadow_pass > 0.5) {
    float heightFade = clamp(0.22 + v_height * 1.3, 0.0, 1.0);
    gl_FragColor = vec4(u_shadow_color, u_shadow_alpha * heightFade);
    return;
  }

  bool front = v_facing >= 0.0;
  // The reflected mesh already reverses its screen-space orientation. Keeping
  // the original UV on the back therefore produces the real mirrored show-through.
  vec2 sampleUv = v_uv;
  vec4 page = texture2D(u_texture, sampleUv);

  float diffuse = 0.78 + 0.22 * abs(v_facing);
  float ridge = pow(max(0.0, 1.0 - abs(v_facing)), 5.0) * 0.2;
  vec3 color;

  if (front) {
    color = page.rgb * diffuse + ridge;
  } else {
    vec3 showThrough = mix(u_paper_color, page.rgb, 0.12);
    color = showThrough * (0.84 + 0.12 * abs(v_facing)) + ridge * 0.55;
  }

  gl_FragColor = vec4(color, page.a);
}
`
