// package com.infinity.gatewayservice.security;

// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.cloud.gateway.filter.GatewayFilterChain;
// import org.springframework.cloud.gateway.filter.GlobalFilter;
// import org.springframework.core.Ordered;
// import org.springframework.core.annotation.Order;
// import org.springframework.http.HttpHeaders;
// import org.springframework.http.HttpStatus;
// import org.springframework.stereotype.Component;
// import org.springframework.web.server.ServerWebExchange;
// import reactor.core.publisher.Mono;

// import io.jsonwebtoken.Jwts;
// import io.jsonwebtoken.Claims;
// import io.jsonwebtoken.JwtException;
// import io.jsonwebtoken.security.Keys;
// import jakarta.annotation.PostConstruct;

// import java.util.List;

// import javax.crypto.SecretKey;
// import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
// import org.springframework.security.core.authority.SimpleGrantedAuthority;
// import org.springframework.security.core.context.ReactiveSecurityContextHolder;
// import org.slf4j.Logger;  import org.slf4j.LoggerFactory;


// @Component
// @Order(Ordered.HIGHEST_PRECEDENCE)
// public class DashboardAuthFilter implements GlobalFilter, Ordered {

//   private SecretKey secretKey;
//     private static final Logger log = LoggerFactory.getLogger(DashboardAuthFilter.class);
//   @Value("${jwt.secret}")
//   private String jwtSecret;

//   @PostConstruct
//   void init() {
//     this.secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes());
//   }

//   @Override
//   public int getOrder() {
//     return Ordered.HIGHEST_PRECEDENCE;
//   }

//   @Override
//   public Mono<Void> filter(ServerWebExchange exchange,
//                            GatewayFilterChain chain) {
//     String path = exchange.getRequest().getPath().value();

//     // only care about dashboards
//     if (!path.startsWith("/prometheus") &&
//         !path.startsWith("/grafana")) {
//       return chain.filter(exchange);
//     }
//     log.debug(">>> saveAnswers DTO = {}", exchange.getRequest().getCookies());
//         log.info(">>> saveAnswers DTO = {}", exchange.getRequest().getCookies());
//     // 1) read cookie
//     var tokenCookie = exchange.getRequest()
//                               .getCookies()
//                               .getFirst("token");
//     if (tokenCookie == null) {
//       exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
//       return exchange.getResponse().setComplete();
//     }
//     String token = tokenCookie.getValue();

//     // 2) validate & extract claims
//     Claims claims;
//     try {
//       claims = Jwts.parser()
//                    .verifyWith(secretKey)
//                    .build()
//                    .parseSignedClaims(token)
//                    .getPayload();
//     } catch (JwtException e) {
//       exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
//       return exchange.getResponse().setComplete();
//     }

//     // 3) build Authentication
//     List<SimpleGrantedAuthority> auths = ((List<String>)claims.get("roles")).stream()
//           .map(SimpleGrantedAuthority::new)
//           .toList();
//     var auth = new UsernamePasswordAuthenticationToken(
//         claims.getSubject(), null, auths);

//     // 4) stash it into Reactor’s SecurityContext
//     return chain.filter(exchange)
//                 .contextWrite(ReactiveSecurityContextHolder.withAuthentication(auth));
//   }
// }
