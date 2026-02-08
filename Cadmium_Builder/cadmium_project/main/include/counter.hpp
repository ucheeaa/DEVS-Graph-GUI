#ifndef COUNTER_HPP
#define COUNTER_HPP

#include <iostream>
#include "cadmium/modeling/devs/atomic.hpp"

using namespace cadmium;

struct counterState {
	double sigma;
	int count;
	int increment;
	bool countUp;

	explicit counterState():  sigma(std::numeric_limits<double>::infinity()),  count(0),  increment(1),  countUp(true) {
	}
};

#ifndef NO_LOGGING
	std::ostream& operator<<(std::ostream &out, const counterState& state) {
		out << "{sigma: " << state.sigma << ", count: " << state.count << ", increment: " << state.increment << ", countUp: " << state.countUp << "}";
		return out;
	}
#endif

class counter : public Atomic<counterState> {
	public:
	//input ports
	Port<int> increment_in;
	Port<bool> direction_in;

	//output ports
	Port<int> count_out;

	counter(const std::string id) : Atomic<counterState>(id, counterState()) {
		//input ports
		increment_in = addInPort<int>("increment_in");
		direction_in = addInPort<bool>("direction_in");

		//output ports
		count_out = addOutPort<int>("count_out");
	}

	void internalTransition(counterState& state) const override {
		if (state.countUp == true) {
			state.count = state.count + state.increment;
			state.sigma = std::numeric_limits<double>::infinity();
		} else if (state.countUp == false) {
			state.count = state.count - state.increment;
			state.sigma = std::numeric_limits<double>::infinity();
		}
	}

	void externalTransition(counterState& state, double e) const override {
		if (!increment_in->empty() && direction_in->empty()) {
			state.increment = increment_in->getBag().back();
			state.sigma = 0.1;
		} else if (!direction_in->empty() && increment_in->empty()) {
			state.countUp = direction_in->getBag().back();
			state.sigma = 0.1;
		} else {
			state.increment = increment_in->getBag().back();
			state.countUp = direction_in->getBag().back();
			state.sigma = 0.1;
		}
	}

	void output(const counterState& state) const override {
		count_out->addMessage(state.count);
	}

	[[nodiscard]] double timeAdvance(const counterState& state) const override {
		return state.sigma;
	}

};

#endif