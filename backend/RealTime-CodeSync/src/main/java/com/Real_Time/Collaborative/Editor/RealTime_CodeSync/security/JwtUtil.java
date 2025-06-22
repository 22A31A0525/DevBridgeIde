package com.Real_Time.Collaborative.Editor.RealTime_CodeSync.security; // Or your preferred security package

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cglib.core.internal.Function;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Date;
import java.util.Map;

@Component
public class JwtUtil {

    // IMPORTANT: Generate a strong, secret key and store it securely (e.g., in application.properties)
    // For production, never hardcode this.
    @Value("${application.security.jwt.secret-key}") // Get from application.properties
    private String secretKey;

    @Value("${application.security.jwt.expiration}") // Token expiration time in milliseconds
    private long jwtExpiration;


    private String buildToken(
           String Username
    ) {
        return Jwts
                .builder()
                .setSubject(Username)
                .setIssuedAt(new Date(System.currentTimeMillis())) // When the token was issued
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration)) // When the token expires
                .signWith(getSignInKey(), SignatureAlgorithm.HS256) // Sign with your secret key and algorithm
                .compact(); // Build the JWT string
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    public String getToken(String UserName){
        return buildToken(UserName);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }


    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts
                .parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}