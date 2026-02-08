#ifndef BOOLEAN_GENERATOR_HPP
#define BOOLEAN_GENERATOR_HPP

#include <iostream>
#include "cadmium/modeling/devs/atomic.hpp"

using namespace cadmium;

struct boolean_generatorState {
	double sigma;
	bool nextBool;

	explicit boolean_generatorState():  sigma(13.0),  nextBool(false) {
	}
};

#ifndef NO_LOGGING
	std::ostream& operator<<(std::ostream &out, const boolean_generatorState& state) {
		out << "{sigma: " << state.sigma << ", nextBool: " << state.nextBool << "}";
		return out;
	}
#endif

class boolean_generator : public Atomic<boolean_generatorState> {
	public:
	//input ports

	//output ports
	Port<bool> bool_out;

	boolean_generator(const std::string id) : Atomic<boolean_generatorState>(id, boolean_generatorState()) {
		//input ports

		//output ports
		bool_out = addOutPort<bool>("bool_out");
	}

	void internalTransition(boolean_generatorState& state) const override {
		state.nextBool = !state.nextBool;
	}

	void externalTransition(boolean_generatorState& state, double e) const override {
		// Not implemented
	}

	void output(const boolean_generatorState& state) const override {
		bool_out->addMessage(state.nextBool);
	}

	[[nodiscard]] double timeAdvance(const boolean_generatorState& state) const override {
		return state.sigma;
	}

};

#endif