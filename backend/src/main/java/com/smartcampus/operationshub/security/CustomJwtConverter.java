package com.smartcampus.operationshub.security;

import com.smartcampus.operationshub.model.Role;
import com.smartcampus.operationshub.model.User;
import com.smartcampus.operationshub.repository.UserRepository;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Component
public class CustomJwtConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final UserRepository userRepository;

    public CustomJwtConverter(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        String name = jwt.getClaimAsString("name");

        if (email == null) {
            return new JwtAuthenticationToken(jwt, List.of());
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        Role role;
        if (userOptional.isPresent()) {
            role = userOptional.get().getRole();
        } else {
            // Auto register the user with default role USER
            User newUser = User.builder()
                    .email(email)
                    .name(name != null ? name : "Unknown")
                    .role(Role.USER)
                    .build();
            userRepository.save(newUser);
            role = newUser.getRole();
        }

        Collection<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));

        return new JwtAuthenticationToken(jwt, authorities);
    }
}
