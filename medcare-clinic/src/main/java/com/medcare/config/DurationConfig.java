package com.medcare.config;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.module.SimpleModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.time.Duration;
@Configuration
public class DurationConfig {

    @Bean
    public SimpleModule durationModule() {
        SimpleModule module = new SimpleModule();
        module.addSerializer(Duration.class, new DurationSerializer());
        module.addDeserializer(Duration.class, new DurationDeserializer());
        return module;
    }

    public static class DurationSerializer extends JsonSerializer<Duration> {
        @Override
        public void serialize(Duration duration, JsonGenerator jsonGenerator,
                              SerializerProvider serializerProvider) throws IOException {
            if (duration == null) {
                jsonGenerator.writeNull();
            } else {
                jsonGenerator.writeStartObject();
                jsonGenerator.writeNumberField("seconds", duration.getSeconds());
                jsonGenerator.writeNumberField("nanos", duration.getNano());
                jsonGenerator.writeEndObject();
            }
        }
    }
    public static class DurationDeserializer extends JsonDeserializer<Duration> {
        @Override
        public Duration deserialize(JsonParser jsonParser,
                                    DeserializationContext deserializationContext) throws IOException {
            JsonNode node = jsonParser.getCodec().readTree(jsonParser);

            try {
                if (node.isObject() && node.has("seconds")) {
                    long seconds = node.get("seconds").asLong();
                    int nanos = node.has("nanos") ? node.get("nanos").asInt() : 0;
                    return Duration.ofSeconds(seconds, nanos);
                }

                if (node.isTextual()) {
                    String text = node.asText();
                    if (text.startsWith("PT")) {
                        return Duration.parse(text);
                    } else {
                        try {
                            long seconds = Long.parseLong(text);
                            return Duration.ofSeconds(seconds);
                        } catch (NumberFormatException e) {
                        }
                    }
                }

                if (node.isNumber()) {
                    return Duration.ofSeconds(node.asLong());
                }

                throw new IOException("Cannot deserialize Duration");
            } catch (Exception e) {
                System.err.println("Error deserializing Duration: " + e.getMessage());
                System.err.println("Node: " + node.toString());
                throw new IOException("Error deserializing Duration: " + e.getMessage(), e);
            }
        }
    }
}